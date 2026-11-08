/**
 * 21st Century Observatory — Visualization, World Map & Chart Engine
 * Built on Chart.js 4 + D3.js v7 / TopoJSON Natural Earth Map + Custom SVG Networks
 */

window.DashboardCharts = (function () {
  const charts = {};
  let currentYearIndex = 25; // Default 2025

  // World Map State
  let worldGeoData = null;
  let activeMapLayer = "netBalance";
  let activeMapOverlay = "both"; // "choropleth", "both", "hotspots"
  let selectedMapCountryCode = "IND";
  let d3Svg = null;
  let d3MapGroup = null;
  let d3Zoom = null;
  let d3Projection = null;

  function getThemeColors() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return {
      isLight,
      text: isLight ? "#334155" : "#94a3b8",
      textStrong: isLight ? "#0f172a" : "#f1f5f9",
      grid: isLight ? "rgba(15, 23, 42, 0.07)" : "rgba(148, 163, 184, 0.1)",
      tooltipBg: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(13, 20, 33, 0.95)",
      tooltipBorder: isLight ? "rgba(15, 23, 42, 0.15)" : "rgba(148, 163, 184, 0.25)",
      unmappedFill: isLight ? "#cbd5e1" : "#1e293b",
      emerald: isLight ? "#059669" : "#10b981",
      cyan: isLight ? "#0284c7" : "#38bdf8",
      indigo: "#818cf8",
      violet: "#a78bfa",
      crimson: isLight ? "#e11d48" : "#f43f5e",
      orange: isLight ? "#ea580c" : "#f97316",
      amber: "#fbbf24"
    };
  }

  // Custom plugin to draw a vertical reference line on time-series charts at selected year
  const verticalYearLinePlugin = {
    id: "verticalYearLine",
    afterDraw(chart) {
      if (!chart.config.options.plugins.verticalYearLine?.enabled) return;
      const idx = currentYearIndex;
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      if (!xScale || !yScale) return;

      const x = xScale.getPixelForValue(idx);
      if (x < xScale.left || x > xScale.right) return;

      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yScale.top);
      ctx.lineTo(x, yScale.bottom);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      const yearLabel = String(window.DASHBOARD_DATA.meta.years[idx]);
      ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillText(yearLabel, Math.min(x + 5, xScale.right - 28), yScale.top + 12);
      ctx.restore();
    }
  };

  Chart.register(verticalYearLinePlugin);

  function baseChartOptions(c, enableYearLine = false) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        verticalYearLine: { enabled: enableYearLine },
        legend: {
          labels: {
            color: c.text,
            font: { family: "'Inter', sans-serif", size: 11, weight: "600" },
            boxWidth: 12,
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: c.tooltipBg,
          titleColor: c.textStrong,
          bodyColor: c.text,
          borderColor: c.tooltipBorder,
          borderWidth: 1,
          padding: 10,
          titleFont: { family: "'Inter', sans-serif", size: 12, weight: "700" },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 }
        }
      },
      scales: {
        x: {
          grid: { color: c.grid },
          ticks: { color: c.text, font: { family: "'JetBrains Mono', monospace", size: 10 } }
        },
        y: {
          grid: { color: c.grid },
          ticks: { color: c.text, font: { family: "'JetBrains Mono', monospace", size: 10 } }
        }
      }
    };
  }

  // ==========================================================================
  // NEW MODULE A: INTERACTIVE D3 + TOPOJSON WORLD MAP
  // ==========================================================================
  const MAP_LAYER_CONFIG = {
    netBalance: {
      title: "Net Resilience Balance (Convergence Score minus Polycrisis Exposure)",
      unit: " pts",
      minLabel: "-75 (Acute Polycrisis Trap)",
      maxLabel: "+74 (High Net Resilience)",
      gradientCss: "linear-gradient(90deg, #be123c 0%, #f43f5e 25%, #f59e0b 48%, #38bdf8 72%, #10b981 100%)",
      getValue: (c) => c.convergenceScore - c.polycrisisExposure,
      format: (v) => (v >= 0 ? `+${v} pts` : `${v} pts`),
      getColor: (v) => {
        if (v <= -40) return "#be123c";
        if (v <= -15) return "#f43f5e";
        if (v < 0) return "#f97316";
        if (v < 15) return "#eab308";
        if (v < 35) return "#38bdf8";
        return "#10b981";
      }
    },
    convergenceScore: {
      title: "Convergence, DOI & Green Transition Score (0–100)",
      unit: "/100",
      minLabel: "20 (Stagnant / Fragile)",
      maxLabel: "95 (Fast Converger / Tech Leader)",
      gradientCss: "linear-gradient(90deg, #334155 0%, #6366f1 30%, #38bdf8 65%, #10b981 100%)",
      getValue: (c) => c.convergenceScore,
      format: (v) => `${v}/100`,
      getColor: (v) => {
        if (v < 40) return "#475569";
        if (v < 58) return "#6366f1";
        if (v < 72) return "#0284c7";
        if (v < 82) return "#38bdf8";
        return "#10b981";
      }
    },
    polycrisisExposure: {
      title: "Polycrisis Human Exposure Index (0–100)",
      unit: "/100",
      minLabel: "15 (Low Direct Exposure)",
      maxLabel: "97 (Extreme Multi-Hazard Exposure)",
      gradientCss: "linear-gradient(90deg, #10b981 0%, #eab308 40%, #f97316 70%, #e11d48 100%)",
      getValue: (c) => c.polycrisisExposure,
      format: (v) => `${v}/100`,
      getColor: (v) => {
        if (v < 35) return "#10b981";
        if (v < 52) return "#38bdf8";
        if (v < 68) return "#eab308";
        if (v < 82) return "#f97316";
        return "#e11d48";
      }
    },
    gdpMultiple: {
      title: "Economic Catch-Up Velocity: GDP/cap PPP Multiple (2025 vs 2000)",
      unit: "x",
      minLabel: "0.5x (Contraction)",
      maxLabel: "7.5x (Hyper-Convergence)",
      gradientCss: "linear-gradient(90deg, #f43f5e 0%, #818cf8 35%, #38bdf8 68%, #10b981 100%)",
      getValue: (c) => +(c.gdpPpp2025 / c.gdpPpp2000).toFixed(2),
      format: (v) => `${v}x`,
      getColor: (v) => {
        if (v < 1.2) return "#f43f5e";
        if (v < 1.8) return "#818cf8";
        if (v < 2.6) return "#38bdf8";
        if (v < 4.0) return "#34d399";
        return "#059669";
      }
    },
    cleanElecShare2025: {
      title: "Clean Electricity Share in 2025 (Renewables + Nuclear %)",
      unit: "%",
      minLabel: "4% (Fossil Locked)",
      maxLabel: "99% (Decarbonized Grid)",
      gradientCss: "linear-gradient(90deg, #475569 0%, #f59e0b 30%, #38bdf8 65%, #10b981 100%)",
      getValue: (c) => c.cleanElecShare2025,
      format: (v) => `${v}%`,
      getColor: (v) => {
        if (v < 20) return "#64748b";
        if (v < 35) return "#eab308";
        if (v < 55) return "#38bdf8";
        if (v < 80) return "#34d399";
        return "#10b981";
      }
    },
    digitalAdoption2025: {
      title: "Digital & Leapfrog Adoption Index (Internet + DPI/Mobile Money %)",
      unit: "%",
      minLabel: "28% (Digital Divide)",
      maxLabel: "99% (Universal DPI)",
      gradientCss: "linear-gradient(90deg, #475569 0%, #a78bfa 40%, #38bdf8 75%, #10b981 100%)",
      getValue: (c) => c.digitalAdoption2025,
      format: (v) => `${v}%`,
      getColor: (v) => {
        if (v < 45) return "#64748b";
        if (v < 68) return "#a78bfa";
        if (v < 82) return "#38bdf8";
        if (v < 92) return "#2dd4bf";
        return "#10b981";
      }
    },
    heatDays2025: {
      title: "Lethal / Extreme Heat Stress Exposure (Days/Year >35°C HI)",
      unit: " days/yr",
      minLabel: "2 days/yr (Temperate)",
      maxLabel: "138 days/yr (Uninhabitable Niche Risk)",
      gradientCss: "linear-gradient(90deg, #38bdf8 0%, #10b981 25%, #eab308 55%, #f97316 78%, #e11d48 100%)",
      getValue: (c) => c.heatDays2025,
      format: (v) => `${v} days/yr`,
      getColor: (v) => {
        if (v < 20) return "#38bdf8";
        if (v < 45) return "#10b981";
        if (v < 75) return "#eab308";
        if (v < 105) return "#f97316";
        return "#e11d48";
      }
    }
  };

  function initWorldMap() {
    const svgEl = document.getElementById("worldMapSvg");
    if (!svgEl || typeof d3 === "undefined") return;

    const width = 920;
    const height = 490;

    d3Svg = d3.select(svgEl).attr("viewBox", `0 0 ${width} ${height}`);
    d3Svg.selectAll("*").remove();

    // Subtle graticule background
    d3Projection = d3.geoNaturalEarth1().scale(168).translate([width / 2, height / 1.88]);
    const pathGen = d3.geoPath().projection(d3Projection);
    const graticule = d3.geoGraticule();

    d3MapGroup = d3Svg.append("g").attr("class", "map-master-group");

    d3MapGroup
      .append("path")
      .datum(graticule())
      .attr("class", "map-graticule")
      .attr("d", pathGen)
      .attr("fill", "none")
      .attr("stroke", "rgba(148, 163, 184, 0.08)")
      .attr("stroke-width", 0.5);

    d3MapGroup.append("g").attr("class", "map-polygons-layer");
    d3MapGroup.append("g").attr("class", "map-bubbles-layer");

    // Setup Zoom & Pan
    d3Zoom = d3
      .zoom()
      .scaleExtent([1, 7])
      .on("zoom", (event) => {
        d3MapGroup.attr("transform", event.transform);
      });

    d3Svg.call(d3Zoom);

    // Load Natural Earth 110m TopoJSON (cached in memory after first load)
    if (worldGeoData) {
      drawWorldMapGeometry(pathGen);
    } else {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then((res) => res.json())
        .then((topo) => {
          worldGeoData = topojson.feature(topo, topo.objects.countries).features;
          drawWorldMapGeometry(pathGen);
        })
        .catch(() => {
          // Offline fallback: render proportional country coordinate circles directly
          drawWorldMapGeometry(pathGen);
        });
    }
  }

  function drawWorldMapGeometry(pathGen) {
    if (!d3MapGroup) return;
    const countries = window.DASHBOARD_DATA.countries;
    const isoMap = {};
    countries.forEach((c) => {
      isoMap[c.isoNum] = c;
      isoMap[String(Number(c.isoNum))] = c;
    });

    const polyLayer = d3MapGroup.select(".map-polygons-layer");
    if (worldGeoData) {
      polyLayer
        .selectAll("path")
        .data(worldGeoData)
        .join("path")
        .attr("class", (d) => {
          const c = isoMap[String(d.id)];
          return c ? `map-country-path has-data code-${c.code}` : "map-country-path";
        })
        .attr("d", pathGen)
        .on("mouseenter", (event, d) => {
          const c = isoMap[String(d.id)];
          if (c) showMapTooltip(event, c);
        })
        .on("mousemove", (event, d) => {
          const c = isoMap[String(d.id)];
          if (c) moveMapTooltip(event);
        })
        .on("mouseleave", hideMapTooltip)
        .on("click", (event, d) => {
          const c = isoMap[String(d.id)];
          if (c) selectMapCountry(c.code);
        });
    }

    updateWorldMapLayer(activeMapLayer);
  }

  function updateWorldMapLayer(layerKey) {
    if (MAP_LAYER_CONFIG[layerKey]) {
      activeMapLayer = layerKey;
    }
    const cfg = MAP_LAYER_CONFIG[activeMapLayer];
    const cTheme = getThemeColors();
    const countries = window.DASHBOARD_DATA.countries;
    const isoMap = {};
    countries.forEach((c) => {
      isoMap[c.isoNum] = c;
      isoMap[String(Number(c.isoNum))] = c;
    });

    // Update Legend UI
    const titleEl = document.getElementById("mapActiveLayerTitle");
    const minEl = document.getElementById("mapLegendMin");
    const maxEl = document.getElementById("mapLegendMax");
    const gradEl = document.getElementById("mapLegendGradient");
    if (titleEl) titleEl.textContent = cfg.title;
    if (minEl) minEl.textContent = cfg.minLabel;
    if (maxEl) maxEl.textContent = cfg.maxLabel;
    if (gradEl) gradEl.style.background = cfg.gradientCss;

    if (!d3MapGroup) return;

    // 1. Color Choropleth Polygons
    d3MapGroup
      .select(".map-polygons-layer")
      .selectAll("path")
      .attr("fill", (d) => {
        const c = isoMap[String(d.id)];
        if (!c) return cTheme.unmappedFill;
        if (activeMapOverlay === "hotspots") {
          return c.polycrisisExposure >= 75 ? "rgba(244, 63, 94, 0.38)" : cTheme.unmappedFill;
        }
        return cfg.getColor(cfg.getValue(c));
      });

    // 2. Render Proportional Bubbles / Hotspots at Country Coordinates
    const bubbleLayer = d3MapGroup.select(".map-bubbles-layer");
    if (activeMapOverlay === "choropleth") {
      bubbleLayer.selectAll("*").remove();
    } else {
      bubbleLayer
        .selectAll("circle")
        .data(countries, (d) => d.code)
        .join("circle")
        .attr("class", "map-bubble-circle")
        .attr("cx", (d) => d3Projection([d.lon, d.lat])[0])
        .attr("cy", (d) => d3Projection([d.lon, d.lat])[1])
        .attr("r", (d) => {
          if (activeMapOverlay === "hotspots") {
            return d.polycrisisExposure >= 70 ? Math.max(5, Math.min(20, (d.polycrisisExposure - 55) * 0.42)) : 3;
          }
          return Math.max(4, Math.min(22, Math.sqrt(d.popM) * 0.72));
        })
        .attr("fill", (d) => {
          if (activeMapOverlay === "hotspots") {
            return d.polycrisisExposure >= 75 ? "#f43f5e" : "#38bdf8";
          }
          return cfg.getColor(cfg.getValue(d));
        })
        .attr("fill-opacity", activeMapOverlay === "hotspots" ? 0.82 : 0.78)
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 1.2)
        .on("mouseenter", (event, d) => showMapTooltip(event, d))
        .on("mousemove", (event) => moveMapTooltip(event))
        .on("mouseleave", hideMapTooltip)
        .on("click", (event, d) => selectMapCountry(d.code));
    }

    // 3. Update Top 5 & Bottom 5 Ranking Lists for Active Layer
    renderMapLeaderboards(cfg);

    // 4. Refresh Selected Country Dossier
    selectMapCountry(selectedMapCountryCode);
  }

  function updateWorldMapOverlay(overlayMode) {
    activeMapOverlay = overlayMode;
    updateWorldMapLayer(activeMapLayer);
  }

  function zoomWorldMap(factor) {
    if (!d3Svg || !d3Zoom) return;
    if (factor === "reset") {
      d3Svg.transition().duration(450).call(d3Zoom.transform, d3.zoomIdentity);
    } else {
      d3Svg.transition().duration(300).call(d3Zoom.scaleBy, factor);
    }
  }

  function showMapTooltip(event, c) {
    const tip = document.getElementById("mapFloatingTooltip");
    if (!tip) return;
    const cfg = MAP_LAYER_CONFIG[activeMapLayer];
    const val = cfg.getValue(c);
    const net = c.convergenceScore - c.polycrisisExposure;

    tip.innerHTML = `
      <div style="font-weight:700; font-size:0.84rem; margin-bottom:2px;">
        ${c.flag} ${c.name} <span style="color:var(--text-muted); font-family:var(--font-mono);">(${c.code})</span>
      </div>
      <div style="font-size:0.7rem; color:var(--conv-cyan); margin-bottom:5px;">${c.archetype}</div>
      <div style="font-family:var(--font-mono); font-size:0.74rem; display:flex; justify-content:space-between; gap:8px;">
        <span>Active Layer:</span>
        <strong style="color:#fff;">${cfg.format(val)}</strong>
      </div>
      <div style="font-family:var(--font-mono); font-size:0.72rem; display:flex; justify-content:space-between; gap:8px;">
        <span>Convergence / Polycrisis:</span>
        <span><b style="color:var(--conv-emerald);">${c.convergenceScore}</b> vs <b style="color:var(--poly-crimson);">${c.polycrisisExposure}</b> (${net >= 0 ? "+" : ""}${net})</span>
      </div>
    `;
    tip.classList.add("visible");
    moveMapTooltip(event);
  }

  function moveMapTooltip(event) {
    const tip = document.getElementById("mapFloatingTooltip");
    const wrap = document.getElementById("mapViewportWrap");
    if (!tip || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = Math.min(rect.width - 250, Math.max(10, event.clientX - rect.left + 14));
    const y = Math.min(rect.height - 110, Math.max(10, event.clientY - rect.top - 20));
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  }

  function hideMapTooltip() {
    const tip = document.getElementById("mapFloatingTooltip");
    if (tip) tip.classList.remove("visible");
  }

  function selectMapCountry(code) {
    selectedMapCountryCode = code;
    const c = window.DASHBOARD_DATA.countries.find((x) => x.code === code) || window.DASHBOARD_DATA.countries[0];
    if (!c) return;

    if (d3MapGroup) {
      d3MapGroup.selectAll(".map-country-path").classed("selected-country", false);
      d3MapGroup.selectAll(`.code-${c.code}`).classed("selected-country", true);
    }

    const net = c.convergenceScore - c.polycrisisExposure;
    const gdpMult = (c.gdpPpp2025 / c.gdpPpp2000).toFixed(1);

    const setTxt = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };

    setTxt("mapDossierName", `${c.flag} ${c.name} (${c.code})`);
    setTxt("mapDossierMeta", `${c.region} • Pop: ${c.popM}M • ${c.archetype}`);
    setTxt("mapDossierConv", `${c.convergenceScore}/100`);
    setTxt("mapDossierPoly", `${c.polycrisisExposure}/100`);
    setTxt("mapDossierNet", `${net >= 0 ? "+" : ""}${net} pts`);
    setTxt("mapDossierGdp", `$${c.gdpPpp2025.toLocaleString()} (${gdpMult}x)`);
    setTxt("mapDossierClean", `${c.cleanElecShare2025}%`);
    setTxt("mapDossierHeat", `${c.heatDays2025} days/yr`);
    setTxt("mapDossierSummary", c.summary);

    const inspectBtn = document.getElementById("mapDossierModalBtn");
    if (inspectBtn) {
      inspectBtn.onclick = () => {
        if (window.DashboardApp && window.DashboardApp.openCountryModal) {
          window.DashboardApp.openCountryModal(c.code);
        }
      };
    }
  }

  function renderMapLeaderboards(cfg) {
    const topEl = document.getElementById("mapTop5List");
    const botEl = document.getElementById("mapBottom5List");
    if (!topEl || !botEl) return;

    const sorted = [...window.DASHBOARD_DATA.countries].sort((a, b) => cfg.getValue(b) - cfg.getValue(a));
    const top5 = sorted.slice(0, 5);
    const bot5 = sorted.slice(-5).reverse();

    const makeHtml = (arr, color) =>
      arr
        .map(
          (c) => `
        <div class="map-rank-item" data-map-code="${c.code}">
          <span>${c.flag} <strong>${c.name}</strong></span>
          <span style="font-family:var(--font-mono); font-weight:700; color:${color};">${cfg.format(cfg.getValue(c))}</span>
        </div>
      `
        )
        .join("");

    topEl.innerHTML = makeHtml(top5, "var(--conv-emerald)");
    botEl.innerHTML = makeHtml(bot5, "var(--poly-crimson)");

    document.querySelectorAll("[data-map-code]").forEach((el) => {
      el.addEventListener("click", () => selectMapCountry(el.getAttribute("data-map-code")));
    });
  }

  // ==========================================================================
  // NEW MODULE B: 3-NATION HEAD-TO-HEAD COMPARATOR CHARTS (NATIONS TAB)
  // ==========================================================================
  function updateNationComparatorCharts(codes) {
    const countries = codes
      .map((code) => window.DASHBOARD_DATA.countries.find((c) => c.code === code))
      .filter(Boolean);
    if (countries.length === 0) return;

    const c = getThemeColors();
    const palette = [
      { border: c.emerald, bg: "rgba(16, 185, 129, 0.18)" },
      { border: c.cyan, bg: "rgba(56, 189, 248, 0.18)" },
      { border: c.crimson, bg: "rgba(244, 63, 94, 0.18)" }
    ];

    // 1. Multi-Nation 7-Axis Radar Comparison Chart
    const radarCtx = document.getElementById("nationCompareRadarChart");
    if (radarCtx) {
      if (charts.nationCompareRadar) charts.nationCompareRadar.destroy();

      charts.nationCompareRadar = new Chart(radarCtx, {
        type: "radar",
        data: {
          labels: [
            "Convergence & DOI Score",
            "Digital Adoption (%)",
            "Clean Electricity (%)",
            "Income Catch-Up (0-100)",
            "Extreme Heat Stress",
            "Water Stress",
            "Debt & Conflict Risk"
          ],
          datasets: countries.map((ct, i) => {
            const incomeGrowthNorm = Math.min(100, Math.round((ct.gdpPpp2025 / Math.max(800, ct.gdpPpp2000)) * 20));
            return {
              label: `${ct.flag} ${ct.name}`,
              data: [
                ct.convergenceScore,
                ct.digitalAdoption2025,
                ct.cleanElecShare2025,
                incomeGrowthNorm,
                Math.min(100, Math.round(ct.heatDays2025 * 0.75)),
                ct.waterStress,
                Math.round((ct.debtVulnerability + ct.conflictRisk) / 2)
              ],
              borderColor: palette[i % 3].border,
              backgroundColor: palette[i % 3].bg,
              borderWidth: 2.5,
              pointRadius: 3.5
            };
          })
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: c.grid },
              grid: { color: c.grid },
              pointLabels: { color: c.textStrong, font: { size: 10, weight: "600" } },
              ticks: { display: false },
              suggestedMin: 0,
              suggestedMax: 100
            }
          },
          plugins: {
            legend: { labels: { color: c.textStrong, font: { size: 11, weight: "600" } } }
          }
        }
      });
    }

    // 2. Multi-Nation Grouped Indicator Bar Chart
    const barCtx = document.getElementById("nationCompareBarChart");
    if (barCtx) {
      if (charts.nationCompareBar) charts.nationCompareBar.destroy();

      const opts = baseChartOptions(c, false);
      opts.scales.y.max = 100;
      opts.scales.y.title = { display: true, text: "Score / Share (0–100)", color: c.text, font: { size: 11 } };

      charts.nationCompareBar = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: [
            "Convergence & DOI",
            "Polycrisis Exposure",
            "Clean Power (%)",
            "Digital Adoption (%)",
            "Water Stress",
            "Debt Vulnerability"
          ],
          datasets: countries.map((ct, i) => ({
            label: `${ct.flag} ${ct.name} ($${ct.gdpPpp2025.toLocaleString()} PPP)`,
            data: [
              ct.convergenceScore,
              ct.polycrisisExposure,
              ct.cleanElecShare2025,
              ct.digitalAdoption2025,
              ct.waterStress,
              ct.debtVulnerability
            ],
            backgroundColor: palette[i % 3].border,
            borderRadius: 4
          }))
        },
        options: opts
      });
    }
  }

  // ==========================================================================
  // EXISTING CHARTS (1–10)
  // ==========================================================================
  function initTwinForceChart() {
    const ctx = document.getElementById("twinForceChart");
    if (!ctx) return;
    const c = getThemeColors();
    const D = window.DASHBOARD_DATA;

    const opts = baseChartOptions(c, true);
    opts.scales.y.title = {
      display: true,
      text: "Composite Index (Year 2000 = 100)",
      color: c.text,
      font: { size: 11, weight: "600" }
    };

    charts.twinForce = new Chart(ctx, {
      type: "line",
      data: {
        labels: D.meta.years,
        datasets: [
          {
            label: "Convergence, DOI & Green Transition Index (2000=100)",
            data: D.timeSeries.convergenceTransitionIndex,
            borderColor: c.emerald,
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 6
          },
          {
            label: "Polycrisis Human Exposure Index (2000=100)",
            data: D.timeSeries.polycrisisExposureIndex,
            borderColor: c.crimson,
            backgroundColor: "rgba(244, 63, 94, 0.12)",
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 6
          }
        ]
      },
      options: opts
    });
  }

  function updateTwinForceMode(mode) {
    const chart = charts.twinForce;
    if (!chart) return;
    const D = window.DASHBOARD_DATA;
    const c = getThemeColors();

    if (mode === "velocity") {
      const diff = D.timeSeries.convergenceTransitionIndex.map(
        (v, i) => +(v - D.timeSeries.polycrisisExposureIndex[i]).toFixed(1)
      );
      chart.data.datasets = [
        {
          label: "Net Buffer: Convergence Lead Over Polycrisis (Index Points)",
          data: diff,
          borderColor: c.cyan,
          backgroundColor: "rgba(56, 189, 248, 0.18)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }
      ];
      chart.options.scales.y.title.text = "Net Resilience Buffer (Index Differential)";
    } else {
      chart.data.datasets = [
        {
          label: "Convergence, DOI & Green Transition Index (2000=100)",
          data: D.timeSeries.convergenceTransitionIndex,
          borderColor: c.emerald,
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 2
        },
        {
          label: "Polycrisis Human Exposure Index (2000=100)",
          data: D.timeSeries.polycrisisExposureIndex,
          borderColor: c.crimson,
          backgroundColor: "rgba(244, 63, 94, 0.12)",
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointRadius: 2
        }
      ];
      chart.options.scales.y.title.text = "Composite Index (Year 2000 = 100)";
    }
    chart.update();
  }

  function initRegionalBalanceChart() {
    const ctx = document.getElementById("regionalBalanceChart");
    if (!ctx) return;
    const c = getThemeColors();
    const regs = window.DASHBOARD_DATA.polycrisis.regionalExposure;

    const opts = baseChartOptions(c, false);
    opts.indexAxis = "y";
    opts.scales.x.max = 100;
    opts.scales.x.title = { display: true, text: "Normalized Score (0–100)", color: c.text, font: { size: 11 } };

    charts.regionalBalance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: regs.map((r) => r.region),
        datasets: [
          {
            label: "Convergence & Green Leapfrog Velocity",
            data: regs.map((r) => Math.round((r.greenLeapfrogScore + r.convergenceVelocity) / 2)),
            backgroundColor: c.emerald,
            borderRadius: 4
          },
          {
            label: "Polycrisis Human Exposure Intensity",
            data: regs.map((r) => {
              const heatShare = (r.lethalHeatPopM / (r.popBillions * 1000)) * 100;
              const waterShare = (r.waterStressPopM / (r.popBillions * 1000)) * 100;
              const dispFactor = Math.min(100, (r.displacedPopM / r.popBillions) * 2.2);
              return Math.min(96, Math.round(heatShare * 0.4 + waterShare * 0.35 + dispFactor * 0.25));
            }),
            backgroundColor: c.crimson,
            borderRadius: 4
          }
        ]
      },
      options: opts
    });
  }

  function initConvergenceChart() {
    const ctx = document.getElementById("convergenceChart");
    if (!ctx) return;
    const c = getThemeColors();
    const D = window.DASHBOARD_DATA;

    const opts = baseChartOptions(c, true);
    opts.scales.y = {
      type: "linear",
      position: "left",
      grid: { color: c.grid },
      ticks: { color: c.text, callback: (v) => v + "%" },
      title: { display: true, text: "Percentage (%)", color: c.text, font: { size: 11 } }
    };
    opts.scales.y1 = {
      type: "linear",
      position: "right",
      grid: { drawOnChartArea: false },
      ticks: { color: c.cyan, callback: (v) => v + "B" },
      title: { display: true, text: "Global Middle Class (Billions)", color: c.cyan, font: { size: 11 } }
    };

    charts.convergence = new Chart(ctx, {
      type: "line",
      data: {
        labels: D.meta.years,
        datasets: [
          {
            label: "Emerging & Developing Economies Share of World GDP (PPP %)",
            data: D.timeSeries.emdeGdpPppShare,
            borderColor: c.emerald,
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2.8,
            yAxisID: "y",
            tension: 0.3
          },
          {
            label: "Global Extreme Poverty Rate (<$2.15/day, %)",
            data: D.timeSeries.extremePovertyRate,
            borderColor: c.amber,
            borderDash: [5, 4],
            borderWidth: 2.5,
            yAxisID: "y",
            tension: 0.3
          },
          {
            label: "Global Middle & Consumer Class (Billions, Right Axis)",
            data: D.timeSeries.globalMiddleClassBillions,
            borderColor: c.cyan,
            backgroundColor: "rgba(56, 189, 248, 0.12)",
            fill: true,
            borderWidth: 2.5,
            yAxisID: "y1",
            tension: 0.3
          }
        ]
      },
      options: opts
    });
  }

  function updateConvergenceChartMode(mode) {
    const chart = charts.convergence;
    if (!chart) return;
    const D = window.DASHBOARD_DATA;
    const c = getThemeColors();

    if (mode === "inequality") {
      chart.options.scales.y.title.text = "Between-Country Gini (0–1)";
      chart.options.scales.y.ticks.callback = (v) => v;
      chart.options.scales.y1.title.text = "Within-Country Top 10% Income Share (%)";
      chart.options.scales.y1.ticks.callback = (v) => v + "%";
      chart.data.datasets = [
        {
          label: "Between-Country Global Inequality (Pop-Weighted Gini — Falling)",
          data: D.timeSeries.betweenCountryGini,
          borderColor: c.emerald,
          borderWidth: 3,
          yAxisID: "y",
          tension: 0.3
        },
        {
          label: "Within-Country Top 10% Income Share (%, Right Axis — Rising)",
          data: D.timeSeries.withinCountryTop10Share,
          borderColor: c.crimson,
          borderWidth: 3,
          yAxisID: "y1",
          tension: 0.3
        }
      ];
    } else {
      chart.options.scales.y.title.text = "Percentage (%)";
      chart.options.scales.y.ticks.callback = (v) => v + "%";
      chart.options.scales.y1.title.text = "Global Middle Class (Billions)";
      chart.options.scales.y1.ticks.callback = (v) => v + "B";
      chart.data.datasets = [
        {
          label: "Emerging & Developing Economies Share of World GDP (PPP %)",
          data: D.timeSeries.emdeGdpPppShare,
          borderColor: c.emerald,
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderWidth: 2.8,
          yAxisID: "y",
          tension: 0.3
        },
        {
          label: "Global Extreme Poverty Rate (<$2.15/day, %)",
          data: D.timeSeries.extremePovertyRate,
          borderColor: c.amber,
          borderDash: [5, 4],
          borderWidth: 2.5,
          yAxisID: "y",
          tension: 0.3
        },
        {
          label: "Global Middle & Consumer Class (Billions, Right Axis)",
          data: D.timeSeries.globalMiddleClassBillions,
          borderColor: c.cyan,
          backgroundColor: "rgba(56, 189, 248, 0.12)",
          fill: true,
          borderWidth: 2.5,
          yAxisID: "y1",
          tension: 0.3
        }
      ];
    }
    chart.update();
  }

  function initIncomeDistChart() {
    const ctx = document.getElementById("incomeDistChart");
    if (!ctx) return;
    const c = getThemeColors();
    const dist = window.DASHBOARD_DATA.incomeDistribution;

    const opts = baseChartOptions(c, false);
    opts.scales.y.title = { display: true, text: "% of World Population in Income Bracket", color: c.text, font: { size: 11 } };
    opts.scales.x.title = { display: true, text: "Daily Income / Consumption per Capita (2017 PPP USD, Log Scale)", color: c.text, font: { size: 11 } };

    charts.incomeDist = new Chart(ctx, {
      type: "line",
      data: {
        labels: dist.bins,
        datasets: [
          {
            label: "Year 2000 (Bimodal 'Twin Peaks' World)",
            data: dist.share2000,
            borderColor: c.crimson,
            backgroundColor: "rgba(244, 63, 94, 0.12)",
            borderDash: [4, 4],
            borderWidth: 2.2,
            fill: true,
            tension: 0.4
          },
          {
            label: "Year 2012 (Emerging Middle Bulge)",
            data: dist.share2012,
            borderColor: c.amber,
            backgroundColor: "rgba(251, 191, 36, 0.08)",
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: "Year 2025 (Unimodal Global Convergence)",
            data: dist.share2025,
            borderColor: c.emerald,
            backgroundColor: "rgba(16, 185, 129, 0.22)",
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: opts
    });
  }

  function initDoiSCurveChart() {
    const ctx = document.getElementById("doiSCurveChart");
    if (!ctx) return;
    const c = getThemeColors();
    const sc = window.DASHBOARD_DATA.innovationDiffusion.sCurves;

    const opts = baseChartOptions(c, false);
    opts.scales.y.title = { display: true, text: "Adoption / Penetration Rate (%)", color: c.text, font: { size: 11 } };
    opts.scales.y.max = 115;

    charts.doiSCurve = new Chart(ctx, {
      type: "line",
      data: {
        labels: sc.years,
        datasets: Object.values(sc.series).map((s) => ({
          label: s.label,
          data: s.data,
          borderColor: s.color,
          backgroundColor: s.color,
          borderWidth: 2.5,
          tension: 0.38,
          pointRadius: 2.5
        }))
      },
      options: opts
    });
  }

  function initWrightsLawChart() {
    const ctx = document.getElementById("wrightsLawChart");
    if (!ctx) return;
    const c = getThemeColors();
    const D = window.DASHBOARD_DATA;

    const opts = baseChartOptions(c, true);
    opts.scales.y = {
      type: "linear",
      position: "left",
      grid: { color: c.grid },
      ticks: { color: c.emerald, callback: (v) => "$" + v.toFixed(2) },
      title: { display: true, text: "Solar PV Module Cost ($/Watt)", color: c.emerald, font: { size: 11 } }
    };
    opts.scales.y1 = {
      type: "linear",
      position: "right",
      grid: { drawOnChartArea: false },
      ticks: { color: c.cyan, callback: (v) => v + " GW" },
      title: { display: true, text: "Cumulative Solar + Wind Installed (GW)", color: c.cyan, font: { size: 11 } }
    };

    charts.wrightsLaw = new Chart(ctx, {
      type: "line",
      data: {
        labels: D.meta.years,
        datasets: [
          {
            label: "Solar PV Module Cost ($/Watt, 2024 USD — Left Axis)",
            data: D.timeSeries.solarPvCostPerWatt,
            borderColor: c.emerald,
            borderWidth: 3,
            yAxisID: "y",
            tension: 0.3
          },
          {
            label: "Cumulative Solar + Wind Installed Capacity (GW — Right Axis)",
            data: D.timeSeries.solarWindCapacityGw,
            borderColor: c.cyan,
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            fill: true,
            borderWidth: 2.8,
            yAxisID: "y1",
            tension: 0.3
          }
        ]
      },
      options: opts
    });
  }

  function updateWrightsLawMode(mode) {
    const chart = charts.wrightsLaw;
    if (!chart) return;
    const D = window.DASHBOARD_DATA;
    const c = getThemeColors();

    if (mode === "batteries") {
      chart.options.scales.y.title.text = "Li-Ion Battery Pack Cost ($/kWh)";
      chart.options.scales.y.ticks.callback = (v) => "$" + v;
      chart.options.scales.y1.title.text = "Global EV Share of New Car Sales (%)";
      chart.options.scales.y1.ticks.callback = (v) => v + "%";
      chart.data.datasets = [
        {
          label: "Li-Ion Battery Pack Price ($/kWh — Left Axis)",
          data: D.timeSeries.batteryPackCostPerKwh,
          borderColor: c.violet,
          borderWidth: 3,
          yAxisID: "y",
          tension: 0.3
        },
        {
          label: "Global EV Share of New Passenger Car Sales (% — Right Axis)",
          data: D.timeSeries.evShareNewSales,
          borderColor: c.emerald,
          backgroundColor: "rgba(16, 185, 129, 0.15)",
          fill: true,
          borderWidth: 2.8,
          yAxisID: "y1",
          tension: 0.3
        }
      ];
    } else {
      chart.options.scales.y.title.text = "Solar PV Module Cost ($/Watt)";
      chart.options.scales.y.ticks.callback = (v) => "$" + v.toFixed(2);
      chart.options.scales.y1.title.text = "Cumulative Solar + Wind Installed (GW)";
      chart.options.scales.y1.ticks.callback = (v) => v + " GW";
      chart.data.datasets = [
        {
          label: "Solar PV Module Cost ($/Watt, 2024 USD — Left Axis)",
          data: D.timeSeries.solarPvCostPerWatt,
          borderColor: c.emerald,
          borderWidth: 3,
          yAxisID: "y",
          tension: 0.3
        },
        {
          label: "Cumulative Solar + Wind Installed Capacity (GW — Right Axis)",
          data: D.timeSeries.solarWindCapacityGw,
          borderColor: c.cyan,
          backgroundColor: "rgba(56, 189, 248, 0.15)",
          fill: true,
          borderWidth: 2.8,
          yAxisID: "y1",
          tension: 0.3
        }
      ];
    }
    chart.update();
  }

  function initPolycrisisTrendChart() {
    const ctx = document.getElementById("polycrisisTrendChart");
    if (!ctx) return;
    const c = getThemeColors();
    const D = window.DASHBOARD_DATA;

    const opts = baseChartOptions(c, true);
    opts.scales.y = {
      type: "linear",
      position: "left",
      grid: { color: c.grid },
      ticks: { color: c.crimson, callback: (v) => v + "M" },
      title: { display: true, text: "Displaced / Acute Food Insecure (Millions)", color: c.crimson, font: { size: 11 } }
    };
    opts.scales.y1 = {
      type: "linear",
      position: "right",
      grid: { drawOnChartArea: false },
      ticks: { color: c.orange, callback: (v) => v + "B" },
      title: { display: true, text: "Lethal Heat Stress Exposed (Billions)", color: c.orange, font: { size: 11 } }
    };

    charts.polycrisisTrend = new Chart(ctx, {
      type: "line",
      data: {
        labels: D.meta.years,
        datasets: [
          {
            label: "Forcibly Displaced People Worldwide (Millions, UNHCR)",
            data: D.timeSeries.forciblyDisplacedMillions,
            borderColor: c.crimson,
            backgroundColor: "rgba(244, 63, 94, 0.14)",
            fill: true,
            borderWidth: 2.8,
            yAxisID: "y",
            tension: 0.3
          },
          {
            label: "Acute Food Insecurity IPC Phase 3+ (Millions, FAO/WFP)",
            data: D.timeSeries.acuteFoodInsecurityMillions,
            borderColor: c.amber,
            borderWidth: 2.5,
            yAxisID: "y",
            tension: 0.3
          },
          {
            label: "Population Exposed to >20 Days/Yr Dangerous Heat (Billions, Right Axis)",
            data: D.timeSeries.heatExposedPopulationBillions,
            borderColor: c.orange,
            borderDash: [5, 3],
            borderWidth: 2.8,
            yAxisID: "y1",
            tension: 0.3
          }
        ]
      },
      options: opts
    });
  }

  function initPlanetaryRadarChart() {
    const ctx = document.getElementById("planetaryRadarChart");
    if (!ctx) return;
    const c = getThemeColors();
    const pb = window.DASHBOARD_DATA.polycrisis.planetaryBoundaries;

    charts.planetaryRadar = new Chart(ctx, {
      type: "radar",
      data: {
        labels: pb.map((b) => b.name.split(" (")[0]),
        datasets: [
          {
            label: "2025 Anthropocene Status (Safe = 100)",
            data: pb.map((b) => b.status2025),
            borderColor: c.crimson,
            backgroundColor: "rgba(244, 63, 94, 0.22)",
            borderWidth: 2.5,
            pointBackgroundColor: c.crimson
          },
          {
            label: "2000 Baseline Status",
            data: pb.map((b) => b.status2000),
            borderColor: c.amber,
            backgroundColor: "rgba(251, 191, 36, 0.1)",
            borderWidth: 2,
            borderDash: [4, 4]
          },
          {
            label: "Safe Planetary Operating Boundary (100)",
            data: pb.map((b) => b.safeThreshold),
            borderColor: c.emerald,
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: c.grid },
            grid: { color: c.grid },
            pointLabels: { color: c.textStrong, font: { family: "'Inter', sans-serif", size: 10, weight: "600" } },
            ticks: { display: false, maxTicksLimit: 5 },
            suggestedMin: 0,
            suggestedMax: 250
          }
        },
        plugins: { legend: { labels: { color: c.text, font: { size: 11 } } } }
      }
    });
  }

  function renderCascadeNetwork() {
    const svg = document.getElementById("cascadeSvg");
    if (!svg) return;
    const nodes = window.DASHBOARD_DATA.polycrisis.cascadeNodes;
    const links = window.DASHBOARD_DATA.polycrisis.cascadeLinks;

    const nodeMap = {};
    nodes.forEach((n) => (nodeMap[n.id] = n));

    let html = `
      <defs>
        <marker id="arrow-amplify" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7 Z" fill="#f43f5e" />
        </marker>
        <marker id="arrow-mitigate" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,1 L7,4 L0,7 Z" fill="#10b981" />
        </marker>
      </defs>
    `;

    links.forEach((link) => {
      const s = nodeMap[link.source];
      const t = nodeMap[link.target];
      if (!s || !t) return;

      const isAmplify = link.effect === "amplifies" || link.effect === "dampens";
      const stroke = isAmplify ? "#f43f5e" : "#10b981";
      const marker = isAmplify ? "url(#arrow-amplify)" : "url(#arrow-mitigate)";
      const dash = isAmplify ? "" : 'stroke-dasharray="5,4"';
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2 - 18;

      html += `
        <g class="cascade-link-group" data-source="${s.id}" data-target="${t.id}">
          <path class="cascade-link"
                d="M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}"
                fill="none"
                stroke="${stroke}"
                stroke-width="2.2"
                stroke-opacity="0.68"
                ${dash}
                marker-end="${marker}" />
          <text x="${mx}" y="${my - 4}" text-anchor="middle" fill="#94a3b8" font-size="9.5" font-family="JetBrains Mono, monospace">
            ${link.weight}
          </text>
        </g>
      `;
    });

    nodes.forEach((n) => {
      const isCrisis = n.type === "crisis";
      const fill = isCrisis ? "rgba(244, 63, 94, 0.16)" : "rgba(16, 185, 129, 0.16)";
      const stroke = isCrisis ? "#f43f5e" : "#10b981";
      const lines = n.label.split("\n");

      html += `
        <g class="cascade-node" data-id="${n.id}" transform="translate(${n.x}, ${n.y})">
          <rect x="-82" y="-28" width="164" height="56" rx="10"
                fill="#111a2b" stroke="${stroke}" stroke-width="2" />
          <rect x="-82" y="-28" width="164" height="56" rx="10"
                fill="${fill}" />
          <text y="-5" text-anchor="middle" fill="#f1f5f9" font-size="11" font-weight="700" font-family="Inter, sans-serif">
            ${lines[0]}
          </text>
          <text y="12" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="JetBrains Mono, monospace">
            ${lines[1] || ""}
          </text>
        </g>
      `;
    });

    svg.innerHTML = html;

    const nodeEls = svg.querySelectorAll(".cascade-node");
    const linkEls = svg.querySelectorAll(".cascade-link-group");
    const statusEl = document.getElementById("cascadeHoverStatus");

    nodeEls.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const id = el.getAttribute("data-id");
        const nodeObj = nodeMap[id];
        linkEls.forEach((l) => {
          const connected = l.getAttribute("data-source") === id || l.getAttribute("data-target") === id;
          l.style.opacity = connected ? "1" : "0.15";
        });
        if (statusEl && nodeObj) {
          statusEl.textContent = `Selected Node: ${nodeObj.label.replace("\n", " ")} — Severity/Impact Score: ${nodeObj.severity}/100`;
        }
      });
      el.addEventListener("mouseleave", () => {
        linkEls.forEach((l) => (l.style.opacity = "1"));
        if (statusEl) {
          statusEl.textContent = "Hover over any systemic node to inspect amplifying polycrisis loops vs. mitigating green/digital feedbacks.";
        }
      });
    });
  }

  function initCountryMatrixChart(filteredRegion = "ALL") {
    const ctx = document.getElementById("countryMatrixChart");
    if (!ctx) return;
    const c = getThemeColors();
    const countries = window.DASHBOARD_DATA.countries.filter(
      (ct) => filteredRegion === "ALL" || ct.region === filteredRegion
    );

    const archetypeColor = (arch) => {
      if (arch.includes("Green Giant")) return c.emerald;
      if (arch.includes("Leapfrogger")) return c.cyan;
      if (arch.includes("Frontline")) return c.orange;
      if (arch.includes("Trap")) return c.crimson;
      if (arch.includes("Resilient")) return c.violet;
      return c.amber;
    };

    const datasetPoints = countries.map((ct) => ({
      x: ct.convergenceScore,
      y: ct.polycrisisExposure,
      r: Math.max(5, Math.min(26, Math.sqrt(ct.popM) * 1.15)),
      country: ct
    }));

    if (charts.countryMatrix) {
      charts.countryMatrix.destroy();
    }

    const quadrantPlugin = {
      id: "quadrantOverlay",
      beforeDraw(chart) {
        const { ctx, scales: { x, y } } = chart;
        const midX = x.getPixelForValue(65);
        const midY = y.getPixelForValue(60);

        ctx.save();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 6]);

        ctx.beginPath();
        ctx.moveTo(midX, y.top);
        ctx.lineTo(midX, y.bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x.left, midY);
        ctx.lineTo(x.right, midY);
        ctx.stroke();

        ctx.font = "600 10px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(244, 63, 94, 0.55)";
        ctx.fillText("Q1: POLYCRISIS TRAP RISK (High Exposure, Low Convergence)", x.left + 10, y.top + 16);

        ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
        ctx.fillText("Q2: HIGH-EXPOSURE LEAPFROGGERS (Racing the Storm)", midX + 10, y.top + 16);

        ctx.fillStyle = "rgba(251, 191, 36, 0.55)";
        ctx.fillText("Q3: MODERATE EXPOSURE / SLOW TRANSITION", x.left + 10, y.bottom - 10);

        ctx.fillStyle = "rgba(16, 185, 129, 0.65)";
        ctx.fillText("Q4: RESILIENT CONVERGERS & TECH LEADERS", midX + 10, y.bottom - 10);
        ctx.restore();
      }
    };

    charts.countryMatrix = new Chart(ctx, {
      type: "bubble",
      plugins: [quadrantPlugin],
      data: {
        datasets: [
          {
            label: "Countries (Click bubble for full profile)",
            data: datasetPoints,
            backgroundColor: datasetPoints.map((p) => archetypeColor(p.country.archetype) + "B3"),
            borderColor: datasetPoints.map((p) => archetypeColor(p.country.archetype)),
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick(evt, elements) {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const countryObj = datasetPoints[idx].country;
            if (window.DashboardApp && window.DashboardApp.openCountryModal) {
              window.DashboardApp.openCountryModal(countryObj.code);
            }
          }
        },
        scales: {
          x: {
            min: 15,
            max: 100,
            grid: { color: c.grid },
            ticks: { color: c.text },
            title: { display: true, text: "Convergence, DOI & Green Transition Score (0–100) →", color: c.emerald, font: { size: 12, weight: "700" } }
          },
          y: {
            min: 10,
            max: 100,
            grid: { color: c.grid },
            ticks: { color: c.text },
            title: { display: true, text: "↑ Polycrisis Human Exposure Index (0–100)", color: c.crimson, font: { size: 12, weight: "700" } }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.tooltipBg,
            titleColor: c.textStrong,
            bodyColor: c.text,
            borderColor: c.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              title(items) {
                const ct = items[0].raw.country;
                return `${ct.flag} ${ct.name} (${ct.region}) — ${ct.archetype}`;
              },
              label(item) {
                const ct = item.raw.country;
                return [
                  `Convergence & DOI Score: ${ct.convergenceScore}/100`,
                  `Polycrisis Exposure Index: ${ct.polycrisisExposure}/100`,
                  `GDP/cap PPP: $${ct.gdpPpp2000.toLocaleString()} (2000) → $${ct.gdpPpp2025.toLocaleString()} (2025)`,
                  `Clean Electricity Share: ${ct.cleanElecShare2025}% | Digital: ${ct.digitalAdoption2025}%`,
                  `Dangerous Heat Days/Yr: ${ct.heatDays2025} | Pop: ${ct.popM}M`
                ];
              }
            }
          }
        }
      }
    });
  }

  function renderCountryModalChart(country) {
    const ctx = document.getElementById("countryModalRadar");
    if (!ctx) return;
    const c = getThemeColors();

    if (charts.countryModalRadar) {
      charts.countryModalRadar.destroy();
    }

    const incomeGrowthScore = Math.min(100, Math.round((country.gdpPpp2025 / Math.max(800, country.gdpPpp2000)) * 22));

    charts.countryModalRadar = new Chart(ctx, {
      type: "radar",
      data: {
        labels: [
          "Economic Convergence",
          "Digital Adoption (DOI)",
          "Clean Electricity Share",
          "Extreme Heat Exposure",
          "Water Stress",
          "Debt Vulnerability",
          "Conflict & Fragility Risk"
        ],
        datasets: [
          {
            label: `${country.name} Profile (0–100)`,
            data: [
              incomeGrowthScore,
              country.digitalAdoption2025,
              country.cleanElecShare2025,
              Math.min(100, Math.round(country.heatDays2025 * 0.75)),
              country.waterStress,
              country.debtVulnerability,
              country.conflictRisk
            ],
            borderColor: c.cyan,
            backgroundColor: "rgba(56, 189, 248, 0.22)",
            borderWidth: 2.5,
            pointBackgroundColor: [c.emerald, c.cyan, c.emerald, c.crimson, c.orange, c.amber, c.crimson],
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: c.grid },
            grid: { color: c.grid },
            pointLabels: { color: c.textStrong, font: { size: 10, weight: "600" } },
            ticks: { display: false },
            suggestedMin: 0,
            suggestedMax: 100
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function initScenarioChart() {
    const ctx = document.getElementById("scenarioProjectionChart");
    if (!ctx) return;
    const c = getThemeColors();
    const years = window.DASHBOARD_DATA.scenarios.projectionYears;

    const opts = baseChartOptions(c, false);
    opts.scales.y.title = { display: true, text: "Projected Global Index (2000 = 100)", color: c.text, font: { size: 11 } };

    charts.scenario = new Chart(ctx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Projected Convergence, DOI & Green Transition Index",
            data: [328, 365, 405, 448, 492, 538],
            borderColor: c.emerald,
            backgroundColor: "rgba(16, 185, 129, 0.14)",
            fill: true,
            borderWidth: 3,
            tension: 0.35
          },
          {
            label: "Projected Polycrisis Human Exposure Index",
            data: [258, 282, 308, 331, 352, 370],
            borderColor: c.crimson,
            backgroundColor: "rgba(244, 63, 94, 0.14)",
            fill: true,
            borderWidth: 3,
            tension: 0.35
          }
        ]
      },
      options: opts
    });
  }

  function updateScenarioProjections(sliders) {
    const { doiVelocity, convergencePolicy, climateAction, geopolitics } = sliders;
    const posDriver = (doiVelocity * 0.35 + convergencePolicy * 0.3 + climateAction * 0.2 + geopolitics * 0.15) / 100;
    const mitigationDriver = (climateAction * 0.4 + geopolitics * 0.3 + convergencePolicy * 0.2 + doiVelocity * 0.1) / 100;

    const baseConv2025 = 328.4;
    const basePoly2025 = 258.2;

    const convSeries = [baseConv2025];
    const polySeries = [basePoly2025];

    for (let step = 1; step <= 5; step++) {
      const convGrowthPer5Yr = 18 + posDriver * 48 - (1 - mitigationDriver) * 14;
      const polyGrowthPer5Yr = 42 * (1 - mitigationDriver * 0.88) - posDriver * 8;

      const prevConv = convSeries[step - 1];
      const prevPoly = polySeries[step - 1];

      convSeries.push(Math.round(prevConv + convGrowthPer5Yr * (1 + step * 0.05)));
      polySeries.push(Math.max(140, Math.round(prevPoly + polyGrowthPer5Yr * (1 + (0.5 - mitigationDriver) * 0.18))));
    }

    if (charts.scenario) {
      charts.scenario.data.datasets[0].data = convSeries;
      charts.scenario.data.datasets[1].data = polySeries;
      charts.scenario.update();
    }

    const warming2050 = +(3.1 - (climateAction * 0.014 + doiVelocity * 0.004)).toFixed(2);
    const cleanShare2050 = Math.min(98, Math.round(38 + doiVelocity * 0.38 + climateAction * 0.22));
    const exposedBillions2050 = Math.max(0.6, +(3.8 - mitigationDriver * 2.5).toFixed(2));
    const poverty2050 = Math.max(0.8, +(9.5 - posDriver * 7.8).toFixed(1));

    return {
      warming2050,
      cleanShare2050,
      exposedBillions2050,
      poverty2050,
      netBalance2050: convSeries[5] - polySeries[5]
    };
  }

  return {
    initAll() {
      initTwinForceChart();
      initRegionalBalanceChart();
      initWorldMap();
      initConvergenceChart();
      initIncomeDistChart();
      initDoiSCurveChart();
      initWrightsLawChart();
      initPolycrisisTrendChart();
      initPlanetaryRadarChart();
      renderCascadeNetwork();
      initCountryMatrixChart("ALL");
      initScenarioChart();
    },
    setYearIndex(idx) {
      currentYearIndex = idx;
      Object.values(charts).forEach((ch) => {
        if (ch && ch.config?.options?.plugins?.verticalYearLine?.enabled) {
          ch.update("none");
        }
      });
    },
    updateWorldMapLayer,
    updateWorldMapOverlay,
    zoomWorldMap,
    selectMapCountry,
    updateNationComparatorCharts,
    updateTwinForceMode,
    updateConvergenceChartMode,
    updateWrightsLawMode,
    initCountryMatrixChart,
    renderCountryModalChart,
    updateScenarioProjections,
    refreshTheme() {
      Object.values(charts).forEach((ch) => ch && ch.destroy());
      this.initAll();
    }
  };
})();
