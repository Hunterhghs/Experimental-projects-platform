/**
 * 21st Century Observatory — Main Interactive Controller
 * Handles Timeline Scrubber, World Map Controls, Overview of Nations Atlas,
 * Head-to-Head Comparator, Country Matrix, Scenario Lab & Exports
 */

window.DashboardApp = (function () {
  let selectedYearIdx = 25; // 2025
  let playInterval = null;
  let currentRegionFilter = "ALL";
  let currentSortField = "convergenceScore";
  let currentSortAsc = false;

  // Overview of Nations Tab State
  let nationAtlasRegion = "ALL";
  let nationAtlasArchetype = "ALL";
  let nationAtlasSort = "netBalance";
  let comparatorCodes = ["CHN", "IND", "NGA"];
  let nextComparatorSlot = 2; // cycles 0, 1, 2 when user clicks "Pin to Compare"

  // ==========================================================================
  // 1. UPDATE HERO TUG-OF-WAR & 8 KPI SCORECARDS FOR SELECTED YEAR
  // ==========================================================================
  function updateYearState(idx) {
    selectedYearIdx = Number(idx);
    const D = window.DASHBOARD_DATA;
    const year = D.meta.years[selectedYearIdx];
    const ts = D.timeSeries;

    const yearPill = document.getElementById("selectedYearPill");
    const yearSlider = document.getElementById("globalYearSlider");
    if (yearPill) yearPill.textContent = year;
    if (yearSlider && Number(yearSlider.value) !== selectedYearIdx) {
      yearSlider.value = selectedYearIdx;
    }

    const convScore = ts.convergenceTransitionIndex[selectedYearIdx];
    const polyScore = ts.polycrisisExposureIndex[selectedYearIdx];
    const netDiff = +(convScore - polyScore).toFixed(1);
    const convSharePct = +((convScore / (convScore + polyScore)) * 100).toFixed(1);

    setText("heroConvScore", convScore.toFixed(1));
    setText("heroPolyScore", polyScore.toFixed(1));
    setText("heroConvDelta", `+${(convScore - 100).toFixed(1)}% vs 2000`);
    setText("heroPolyDelta", `+${(polyScore - 100).toFixed(1)}% vs 2000`);

    const netBadge = document.getElementById("heroNetBadge");
    if (netBadge) {
      const sign = netDiff >= 0 ? "+" : "";
      netBadge.textContent = `${year} Net Balance: ${sign}${netDiff} pts (${convSharePct}% Convergence vs ${(100 - convSharePct).toFixed(1)}% Polycrisis)`;
      netBadge.style.borderColor = netDiff >= 35 ? "var(--conv-emerald)" : netDiff >= 0 ? "var(--conv-cyan)" : "var(--poly-crimson)";
    }

    const convBar = document.getElementById("tugBarConv");
    if (convBar) convBar.style.width = `${convSharePct}%`;

    // Update 8 KPI Cards
    const emdeShare = ts.emdeGdpPppShare[selectedYearIdx];
    setText("kpiEmdeShare", `${emdeShare.toFixed(1)}%`);
    setText("kpiEmdeDelta", `+${(emdeShare - ts.emdeGdpPppShare[0]).toFixed(1)} pp since 2000`);
    setBarWidth("kpiBarEmde", emdeShare);

    const pov = ts.extremePovertyRate[selectedYearIdx];
    setText("kpiPoverty", `${pov.toFixed(1)}%`);
    setText("kpiPovertyDelta", `${(pov - ts.extremePovertyRate[0]).toFixed(1)} pp since 2000`);
    setBarWidth("kpiBarPoverty", Math.min(100, (pov / 35) * 100));

    const solarCost = ts.solarPvCostPerWatt[selectedYearIdx];
    const dropPct = (((solarCost - ts.solarPvCostPerWatt[0]) / ts.solarPvCostPerWatt[0]) * 100).toFixed(0);
    setText("kpiSolarCost", `$${solarCost.toFixed(2)}/W`);
    setText("kpiSolarDelta", `${dropPct}% vs 2000 ($4.88/W)`);
    setBarWidth("kpiBarSolar", Math.max(8, 100 - (solarCost / 5) * 100));

    const netPen = ts.internetPenetration[selectedYearIdx];
    const gw = ts.solarWindCapacityGw[selectedYearIdx];
    setText("kpiDigital", `${netPen.toFixed(1)}%`);
    setText("kpiDigitalDelta", `${gw.toLocaleString()} GW Solar+Wind`);
    setBarWidth("kpiBarDigital", netPen);

    const temp = ts.tempAnomalyCelsius[selectedYearIdx];
    setText("kpiTemp", `+${temp.toFixed(2)}°C`);
    setText("kpiTempDelta", `+${(temp - ts.tempAnomalyCelsius[0]).toFixed(2)}°C vs 2000`);
    setBarWidth("kpiBarTemp", Math.min(100, (temp / 2.0) * 100));

    const heatPop = ts.heatExposedPopulationBillions[selectedYearIdx];
    setText("kpiHeatPop", `${heatPop.toFixed(2)}B`);
    setText("kpiHeatDelta", `+${(heatPop - ts.heatExposedPopulationBillions[0]).toFixed(2)}B people vs 2000`);
    setBarWidth("kpiBarHeat", Math.min(100, (heatPop / 3.2) * 100));

    const disp = ts.forciblyDisplacedMillions[selectedYearIdx];
    setText("kpiDisplaced", `${disp.toFixed(1)}M`);
    setText("kpiDisplacedDelta", `+${(disp - ts.forciblyDisplacedMillions[0]).toFixed(1)}M vs 2000`);
    setBarWidth("kpiBarDisplaced", Math.min(100, (disp / 140) * 100));

    const conf = ts.activeStateConflicts[selectedYearIdx];
    const food = ts.acuteFoodInsecurityMillions[selectedYearIdx];
    setText("kpiConflicts", `${conf} Wars`);
    setText("kpiConflictsDelta", `${food}M in Acute Food Crisis`);
    setBarWidth("kpiBarConflicts", Math.min(100, (conf / 70) * 100));

    if (window.DashboardCharts) {
      window.DashboardCharts.setYearIndex(selectedYearIdx);
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setBarWidth(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.max(4, Math.min(100, pct))}%`;
  }

  // ==========================================================================
  // 2. RENDER OVERVIEW OF NATIONS TAB (ARCHETYPES, COMPARATOR & CARDS ATLAS)
  // ==========================================================================
  function getArchetypeClass(arch) {
    if (arch.includes("Green Giant")) return "arch-green";
    if (arch.includes("Leapfrogger")) return "arch-leap";
    if (arch.includes("Frontline")) return "arch-front";
    if (arch.includes("Trap")) return "arch-trap";
    return "arch-res";
  }

  function renderArchetypeSummaryCards() {
    const container = document.getElementById("archetypeOverviewGrid");
    if (!container) return;

    const archetypes = [
      { key: "Fast Converger / Green Giant", label: "Fast Convergers & Green Giants", pill: "arch-green" },
      { key: "High-Exposure Leapfrogger", label: "High-Exposure Leapfroggers", pill: "arch-leap" },
      { key: "Climate Frontline Converger", label: "Climate Frontline Convergers", pill: "arch-front" },
      { key: "Resilient Tech Leader", label: "Resilient Tech Leaders", pill: "arch-res" },
      { key: "Polycrisis Trap Risk", label: "Polycrisis Trap Risk", pill: "arch-trap" }
    ];

    const allCountries = window.DASHBOARD_DATA.countries;

    container.innerHTML = archetypes
      .map((a) => {
        const group = allCountries.filter((c) => c.archetype === a.key);
        const totalPop = group.reduce((s, c) => s + c.popM, 0);
        const avgConv = Math.round(group.reduce((s, c) => s + c.convergenceScore, 0) / Math.max(1, group.length));
        const avgPoly = Math.round(group.reduce((s, c) => s + c.polycrisisExposure, 0) / Math.max(1, group.length));
        const isActive = nationAtlasArchetype === a.key;

        return `
          <div class="archetype-summary-card ${isActive ? "active" : ""}" data-arch-filter="${a.key}">
            <div class="arch-card-top">
              <span class="archetype-pill ${a.pill}">${group.length} Nations</span>
              <span class="arch-card-count">${(totalPop / 1000).toFixed(2)}B Pop</span>
            </div>
            <div class="arch-card-title">${a.label}</div>
            <div class="arch-card-stats">
              <span style="color:var(--conv-emerald);">Avg Conv: ${avgConv}</span>
              <span style="color:var(--poly-crimson);">Avg Risk: ${avgPoly}</span>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".archetype-summary-card").forEach((card) => {
      card.addEventListener("click", () => {
        const clickedArch = card.getAttribute("data-arch-filter");
        nationAtlasArchetype = nationAtlasArchetype === clickedArch ? "ALL" : clickedArch;
        renderArchetypeSummaryCards();
        renderNationsDossierCards();
      });
    });
  }

  function initNationComparator() {
    const selects = ["compSelect1", "compSelect2", "compSelect3"].map((id) => document.getElementById(id));
    if (!selects[0]) return;

    const sortedCountries = [...window.DASHBOARD_DATA.countries].sort((a, b) => a.name.localeCompare(b.name));
    const optionsHtml = sortedCountries
      .map((c) => `<option value="${c.code}">${c.flag} ${c.name} (${c.region})</option>`)
      .join("");

    selects.forEach((sel, idx) => {
      if (!sel) return;
      sel.innerHTML = optionsHtml;
      sel.value = comparatorCodes[idx];
      sel.addEventListener("change", () => {
        comparatorCodes[idx] = sel.value;
        refreshComparatorView();
      });
    });

    // Preset comparison buttons
    document.querySelectorAll("[data-comp-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-comp-preset]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const codes = btn.getAttribute("data-comp-preset").split(",");
        comparatorCodes = codes;
        selects.forEach((sel, idx) => {
          if (sel && codes[idx]) sel.value = codes[idx];
        });
        refreshComparatorView();
      });
    });

    refreshComparatorView();
  }

  function refreshComparatorView() {
    if (window.DashboardCharts && window.DashboardCharts.updateNationComparatorCharts) {
      window.DashboardCharts.updateNationComparatorCharts(comparatorCodes);
    }
  }

  function pinNationToComparator(code) {
    if (!comparatorCodes.includes(code)) {
      comparatorCodes[nextComparatorSlot] = code;
      nextComparatorSlot = (nextComparatorSlot + 1) % 3;
      ["compSelect1", "compSelect2", "compSelect3"].forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el) el.value = comparatorCodes[idx];
      });
      refreshComparatorView();
    }
    const compEl = document.getElementById("nationComparatorBox");
    if (compEl) compEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function renderNationsDossierCards() {
    const grid = document.getElementById("nationsCardsGrid");
    if (!grid) return;

    const searchVal = (document.getElementById("nationsSearchInput")?.value || "").toLowerCase().trim();

    let list = window.DASHBOARD_DATA.countries.filter((c) => {
      const matchReg = nationAtlasRegion === "ALL" || c.region === nationAtlasRegion;
      const matchArch = nationAtlasArchetype === "ALL" || c.archetype === nationAtlasArchetype;
      const matchSearch =
        !searchVal ||
        c.name.toLowerCase().includes(searchVal) ||
        c.code.toLowerCase().includes(searchVal) ||
        c.archetype.toLowerCase().includes(searchVal) ||
        c.summary.toLowerCase().includes(searchVal);
      return matchReg && matchArch && matchSearch;
    });

    list.sort((a, b) => {
      if (nationAtlasSort === "netBalance") {
        return b.convergenceScore - b.polycrisisExposure - (a.convergenceScore - a.polycrisisExposure);
      }
      if (nationAtlasSort === "convergenceScore") return b.convergenceScore - a.convergenceScore;
      if (nationAtlasSort === "polycrisisExposure") return b.polycrisisExposure - a.polycrisisExposure;
      if (nationAtlasSort === "gdpMultiple") return b.gdpPpp2025 / b.gdpPpp2000 - a.gdpPpp2025 / a.gdpPpp2000;
      if (nationAtlasSort === "cleanElecShare2025") return b.cleanElecShare2025 - a.cleanElecShare2025;
      if (nationAtlasSort === "popM") return b.popM - a.popM;
      return a.name.localeCompare(b.name);
    });

    const countBadge = document.getElementById("nationsShownCount");
    if (countBadge) {
      countBadge.textContent = `Showing ${list.length} of ${window.DASHBOARD_DATA.countries.length} Nations`;
    }

    grid.innerHTML = list
      .map((c) => {
        const net = c.convergenceScore - c.polycrisisExposure;
        const netColor = net >= 10 ? "var(--conv-emerald)" : net >= -10 ? "var(--conv-cyan)" : "var(--poly-crimson)";
        const gdpMult = (c.gdpPpp2025 / c.gdpPpp2000).toFixed(1);

        return `
          <article class="nation-dossier-card">
            <div>
              <div class="nation-card-header">
                <div class="nation-title-cluster">
                  <span class="nation-flag">${c.flag}</span>
                  <div class="nation-name-row">
                    <h4>${c.name} <span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--text-muted);">${c.code}</span></h4>
                    <div class="nation-meta-sub">${c.region} • Pop: ${c.popM}M</div>
                  </div>
                </div>
                <span class="archetype-pill ${getArchetypeClass(c.archetype)}">${c.archetype}</span>
              </div>

              <div class="nation-dual-bars" style="margin-top:0.75rem;">
                <div class="nation-bar-row">
                  <span class="nation-bar-label">Convergence &amp; DOI</span>
                  <div class="nation-bar-track">
                    <div class="nation-bar-fill" style="width:${c.convergenceScore}%; background:var(--conv-emerald);"></div>
                  </div>
                  <span class="nation-bar-val" style="color:var(--conv-emerald);">${c.convergenceScore}</span>
                </div>
                <div class="nation-bar-row">
                  <span class="nation-bar-label">Polycrisis Exposure</span>
                  <div class="nation-bar-track">
                    <div class="nation-bar-fill" style="width:${c.polycrisisExposure}%; background:var(--poly-crimson);"></div>
                  </div>
                  <span class="nation-bar-val" style="color:var(--poly-crimson);">${c.polycrisisExposure}</span>
                </div>
              </div>

              <div class="nation-metrics-4grid" style="margin-top:0.65rem;">
                <div class="nation-metric-cell">
                  <span>GDP/cap PPP (2000→2025)</span>
                  <strong>$${c.gdpPpp2025.toLocaleString()} <em style="color:var(--conv-emerald); font-style:normal; font-size:0.72rem;">(${gdpMult}x)</em></strong>
                </div>
                <div class="nation-metric-cell">
                  <span>Clean Electricity / Digital</span>
                  <strong>${c.cleanElecShare2025}% <span style="color:var(--text-muted);">|</span> ${c.digitalAdoption2025}%</strong>
                </div>
                <div class="nation-metric-cell">
                  <span>Dangerous Heat Stress</span>
                  <strong style="color:${c.heatDays2025 >= 80 ? "var(--poly-orange)" : "var(--text-primary)"};">${c.heatDays2025} days/yr</strong>
                </div>
                <div class="nation-metric-cell">
                  <span>Net Resilience Balance</span>
                  <strong style="color:${netColor};">${net >= 0 ? "+" : ""}${net} pts</strong>
                </div>
              </div>

              <p class="nation-summary-text" style="margin-top:0.7rem;">
                ${c.summary}
              </p>
            </div>

            <div class="nation-card-actions">
              <button class="chip-btn" data-pin-compare="${c.code}" type="button">
                ⚖ Pin to 3-Nation Compare
              </button>
              <button class="chip-btn active" data-open-modal="${c.code}" type="button">
                ◎ 7-Axis Radar Profile
              </button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-pin-compare]").forEach((btn) => {
      btn.addEventListener("click", () => pinNationToComparator(btn.getAttribute("data-pin-compare")));
    });

    grid.querySelectorAll("[data-open-modal]").forEach((btn) => {
      btn.addEventListener("click", () => openCountryModal(btn.getAttribute("data-open-modal")));
    });
  }

  // ==========================================================================
  // 3. RENDER DIFFUSION COMPRESSION LIST (1840s - 2025)
  // ==========================================================================
  function renderCompressionList() {
    const container = document.getElementById("compressionListContainer");
    if (!container) return;
    const items = window.DASHBOARD_DATA.innovationDiffusion.compressionHistory;

    container.innerHTML = items
      .map((item) => {
        const globalWidth = Math.max(5, Math.round((item.globalYearsTo50 / 90) * 100));
        const lagWidth = Math.max(3, Math.round((Math.abs(item.emdeLagYears) / 90) * 100));
        const isLeapfrog = item.emdeLagYears <= 1;
        const lagText =
          item.emdeLagYears < 0
            ? `EMDE Lead (${Math.abs(item.emdeLagYears)}y ahead)`
            : item.emdeLagYears === 0
            ? "0 yr Lag (Simultaneous)"
            : `${item.emdeLagYears} yr South Lag`;

        return `
          <div class="compression-item">
            <div class="compression-tech-name">
              <span>${item.tech}</span>
              <span class="compression-era">${item.era}</span>
            </div>
            <div class="compression-bars">
              <div class="comp-bar-row" title="Years to 50% Global Adoption: ${item.globalYearsTo50} years">
                <div class="comp-bar-fill" style="width:${globalWidth}%; background: var(--conv-cyan);"></div>
                <span style="font-size:0.68rem; color:var(--text-secondary);">${item.globalYearsTo50}y to 50%</span>
              </div>
              <div class="comp-bar-row" title="Global South Adoption Lag: ${lagText}">
                <div class="comp-bar-fill" style="width:${lagWidth}%; background: ${isLeapfrog ? "var(--conv-emerald)" : "var(--poly-orange)"};"></div>
              </div>
            </div>
            <div class="comp-lag-badge" style="color: ${isLeapfrog ? "var(--conv-emerald)" : "var(--text-secondary)"};">
              ${lagText}
            </div>
          </div>
        `;
      })
      .join("");
  }

  // ==========================================================================
  // 4. COUNTRY MATRIX TABLE & DRILL-DOWN MODAL
  // ==========================================================================
  function renderCountryTable() {
    const tbody = document.getElementById("countryTableBody");
    if (!tbody) return;
    const searchVal = (document.getElementById("countrySearchInput")?.value || "").toLowerCase().trim();

    let list = window.DASHBOARD_DATA.countries.filter((c) => {
      const matchesRegion = currentRegionFilter === "ALL" || c.region === currentRegionFilter;
      const matchesSearch =
        !searchVal ||
        c.name.toLowerCase().includes(searchVal) ||
        c.code.toLowerCase().includes(searchVal) ||
        c.archetype.toLowerCase().includes(searchVal);
      return matchesRegion && matchesSearch;
    });

    list.sort((a, b) => {
      const vA = a[currentSortField];
      const vB = b[currentSortField];
      if (typeof vA === "string") {
        return currentSortAsc ? vA.localeCompare(vB) : vB.localeCompare(vA);
      }
      return currentSortAsc ? vA - vB : vB - vA;
    });

    tbody.innerHTML = list
      .map((c) => {
        const netRes = c.convergenceScore - c.polycrisisExposure;
        const netColor = netRes >= 10 ? "var(--conv-emerald)" : netRes >= -10 ? "var(--conv-cyan)" : "var(--poly-crimson)";
        const gdpMultiple = (c.gdpPpp2025 / c.gdpPpp2000).toFixed(1);

        return `
          <tr data-code="${c.code}">
            <td>
              <span>${c.flag}</span> <strong>${c.name}</strong>
              <span style="font-family:var(--font-mono); font-size:0.68rem; color:var(--text-muted); margin-left:4px;">${c.code}</span>
            </td>
            <td style="color:var(--text-secondary);">${c.region}</td>
            <td><span class="archetype-pill ${getArchetypeClass(c.archetype)}">${c.archetype}</span></td>
            <td>
              <div class="score-bar-inline">
                <span style="color:var(--conv-emerald); width:24px;">${c.convergenceScore}</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill" style="width:${c.convergenceScore}%; background:var(--conv-emerald);"></div>
                </div>
              </div>
            </td>
            <td>
              <div class="score-bar-inline">
                <span style="color:var(--poly-crimson); width:24px;">${c.polycrisisExposure}</span>
                <div class="score-bar-track">
                  <div class="score-bar-fill" style="width:${c.polycrisisExposure}%; background:var(--poly-crimson);"></div>
                </div>
              </div>
            </td>
            <td style="font-family:var(--font-mono); font-weight:700; color:${netColor};">
              ${netRes >= 0 ? "+" : ""}${netRes}
            </td>
            <td style="font-family:var(--font-mono);">
              $${c.gdpPpp2025.toLocaleString()} <span style="color:var(--conv-emerald); font-size:0.7rem;">(${gdpMultiple}x)</span>
            </td>
            <td style="font-family:var(--font-mono);">${c.cleanElecShare2025}%</td>
            <td style="font-family:var(--font-mono);">${c.digitalAdoption2025}%</td>
            <td style="font-family:var(--font-mono); color:${c.heatDays2025 > 80 ? "var(--poly-crimson)" : "var(--text-secondary)"};">
              ${c.heatDays2025}d
            </td>
          </tr>
        `;
      })
      .join("");

    tbody.querySelectorAll("tr").forEach((row) => {
      row.addEventListener("click", () => openCountryModal(row.getAttribute("data-code")));
    });
  }

  function openCountryModal(code) {
    const country = window.DASHBOARD_DATA.countries.find((c) => c.code === code);
    if (!country) return;

    const modal = document.getElementById("countryModalBackdrop");
    if (!modal) return;

    const gdpGrowthPct = (((country.gdpPpp2025 - country.gdpPpp2000) / country.gdpPpp2000) * 100).toFixed(0);
    const netBalance = country.convergenceScore - country.polycrisisExposure;

    setText("modalCountryTitle", `${country.flag} ${country.name} (${country.code})`);
    setText("modalCountrySubtitle", `${country.region} • Population: ${country.popM}M • Archetype: ${country.archetype}`);
    setText("modalConvScore", `${country.convergenceScore}/100`);
    setText("modalPolyScore", `${country.polycrisisExposure}/100`);
    setText("modalNetScore", `${netBalance >= 0 ? "+" : ""}${netBalance} pts`);
    setText("modalGdpTrajectory", `$${country.gdpPpp2000.toLocaleString()} (2000) → $${country.gdpPpp2025.toLocaleString()} (2025) [${gdpGrowthPct >= 0 ? "+" : ""}${gdpGrowthPct}%]`);
    setText("modalCleanElec", `${country.cleanElecShare2025}%`);
    setText("modalDigital", `${country.digitalAdoption2025}%`);
    setText("modalHeatDays", `${country.heatDays2025} days/yr`);
    setText("modalWaterStress", `${country.waterStress}/100`);
    setText("modalDebt", `${country.debtVulnerability}/100`);
    setText("modalConflict", `${country.conflictRisk}/100`);
    setText("modalCountrySummary", country.summary);

    modal.classList.add("open");
    if (window.DashboardCharts) {
      window.DashboardCharts.renderCountryModalChart(country);
    }
  }

  // ==========================================================================
  // 5. 2025–2050 SCENARIO SIMULATOR CONTROLS
  // ==========================================================================
  function initScenarioSimulator() {
    const sliderIds = ["simSliderDoi", "simSliderConv", "simSliderClimate", "simSliderGeo"];

    function readSlidersAndUpdate() {
      const sliders = {
        doiVelocity: Number(document.getElementById("simSliderDoi")?.value || 68),
        convergencePolicy: Number(document.getElementById("simSliderConv")?.value || 55),
        climateAction: Number(document.getElementById("simSliderClimate")?.value || 52),
        geopolitics: Number(document.getElementById("simSliderGeo")?.value || 42)
      };

      setText("simValDoi", `${sliders.doiVelocity}/100`);
      setText("simValConv", `${sliders.convergencePolicy}/100`);
      setText("simValClimate", `${sliders.climateAction}/100`);
      setText("simValGeo", `${sliders.geopolitics}/100`);

      if (window.DashboardCharts) {
        const res = window.DashboardCharts.updateScenarioProjections(sliders);
        if (res) {
          setText("simOutWarming", `+${res.warming2050}°C`);
          setText("simOutClean", `${res.cleanShare2050}%`);
          setText("simOutExposed", `${res.exposedBillions2050}B`);
          setText("simOutPoverty", `${res.poverty2050}%`);
        }
      }
    }

    sliderIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
          readSlidersAndUpdate();
        });
      }
    });

    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-preset");
        const preset = window.DASHBOARD_DATA.scenarios.presets[key];
        if (!preset) return;

        document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        document.getElementById("simSliderDoi").value = preset.sliders.doiVelocity;
        document.getElementById("simSliderConv").value = preset.sliders.convergencePolicy;
        document.getElementById("simSliderClimate").value = preset.sliders.climateAction;
        document.getElementById("simSliderGeo").value = preset.sliders.geopolitics;

        setText("simPresetDescription", preset.description);
        readSlidersAndUpdate();
      });
    });

    readSlidersAndUpdate();
  }

  // ==========================================================================
  // 6. DATA EXPORT (CSV)
  // ==========================================================================
  function exportCountriesCsv() {
    const countries = window.DASHBOARD_DATA.countries;
    const headers = [
      "Code", "Country", "Region", "Population_M", "Archetype",
      "Convergence_DOI_Score", "Polycrisis_Exposure_Index",
      "GDP_PPP_2000", "GDP_PPP_2025", "Clean_Electricity_2025_Pct",
      "Digital_Adoption_2025_Pct", "Lethal_Heat_Days_2025",
      "Water_Stress_Score", "Debt_Vulnerability_Score", "Conflict_Risk_Score", "Synthesis_Summary"
    ];

    const rows = countries.map((c) => [
      c.code, `"${c.name}"`, `"${c.region}"`, c.popM, `"${c.archetype}"`,
      c.convergenceScore, c.polycrisisExposure, c.gdpPpp2000, c.gdpPpp2025,
      c.cleanElecShare2025, c.digitalAdoption2025, c.heatDays2025,
      c.waterStress, c.debtVulnerability, c.conflictRisk, `"${c.summary.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "21st_century_nations_convergence_vs_polycrisis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==========================================================================
  // 7. INITIALIZE EVENT LISTENERS
  // ==========================================================================
  function bindEvents() {
    const slider = document.getElementById("globalYearSlider");
    if (slider) {
      slider.addEventListener("input", (e) => {
        if (playInterval) stopTimelinePlayback();
        updateYearState(e.target.value);
      });
    }

    const playBtn = document.getElementById("playTimelineBtn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (playInterval) {
          stopTimelinePlayback();
        } else {
          if (selectedYearIdx >= 25) selectedYearIdx = 0;
          playBtn.innerHTML = "⏸ Pause";
          playInterval = setInterval(() => {
            if (selectedYearIdx < 25) {
              updateYearState(selectedYearIdx + 1);
            } else {
              stopTimelinePlayback();
            }
          }, 420);
        }
      });
    }

    function stopTimelinePlayback() {
      if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
      }
      const btn = document.getElementById("playTimelineBtn");
      if (btn) btn.innerHTML = "▶ Play 2000–2025";
    }

    // Navigation Tabs
    document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        document.querySelectorAll(".nav-tab-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const sections = document.querySelectorAll(".dashboard-section");
        if (target === "all") {
          sections.forEach((s) => s.classList.remove("hidden-section"));
        } else {
          sections.forEach((s) => {
            if (s.getAttribute("data-section") === target) {
              s.classList.remove("hidden-section");
            } else {
              s.classList.add("hidden-section");
            }
          });
        }
      });
    });

    // World Map Layer Buttons
    document.querySelectorAll("[data-map-layer]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-map-layer]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        window.DashboardCharts.updateWorldMapLayer(btn.getAttribute("data-map-layer"));
      });
    });

    // World Map Overlay Mode Buttons
    document.querySelectorAll("[data-map-overlay]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-map-overlay]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        window.DashboardCharts.updateWorldMapOverlay(btn.getAttribute("data-map-overlay"));
      });
    });

    // World Map Zoom Controls
    const zIn = document.getElementById("mapZoomInBtn");
    const zOut = document.getElementById("mapZoomOutBtn");
    const zReset = document.getElementById("mapZoomResetBtn");
    if (zIn) zIn.addEventListener("click", () => window.DashboardCharts.zoomWorldMap(1.4));
    if (zOut) zOut.addEventListener("click", () => window.DashboardCharts.zoomWorldMap(0.7));
    if (zReset) zReset.addEventListener("click", () => window.DashboardCharts.zoomWorldMap("reset"));

    // Overview of Nations Filters & Search
    document.querySelectorAll("[data-nation-region]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-nation-region]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        nationAtlasRegion = btn.getAttribute("data-nation-region");
        renderNationsDossierCards();
      });
    });

    const nationsSearch = document.getElementById("nationsSearchInput");
    if (nationsSearch) {
      nationsSearch.addEventListener("input", renderNationsDossierCards);
    }

    const nationsSort = document.getElementById("nationsSortSelect");
    if (nationsSort) {
      nationsSort.addEventListener("change", (e) => {
        nationAtlasSort = e.target.value;
        renderNationsDossierCards();
      });
    }

    // Existing Chart Mode Toggle Chips
    document.querySelectorAll("[data-twin-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-twin-mode]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        window.DashboardCharts.updateTwinForceMode(btn.getAttribute("data-twin-mode"));
      });
    });

    document.querySelectorAll("[data-conv-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-conv-mode]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        window.DashboardCharts.updateConvergenceChartMode(btn.getAttribute("data-conv-mode"));
      });
    });

    document.querySelectorAll("[data-wright-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-wright-mode]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        window.DashboardCharts.updateWrightsLawMode(btn.getAttribute("data-wright-mode"));
      });
    });

    // Country Matrix Region Filter Pills
    document.querySelectorAll("[data-region-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-region-filter]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentRegionFilter = btn.getAttribute("data-region-filter");
        renderCountryTable();
        window.DashboardCharts.initCountryMatrixChart(currentRegionFilter);
      });
    });

    const searchInput = document.getElementById("countrySearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => renderCountryTable());
    }

    document.querySelectorAll("th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const field = th.getAttribute("data-sort");
        if (currentSortField === field) {
          currentSortAsc = !currentSortAsc;
        } else {
          currentSortField = field;
          currentSortAsc = false;
        }
        renderCountryTable();
      });
    });

    // Theme Toggle
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const root = document.documentElement;
        const isLight = root.getAttribute("data-theme") === "light";
        root.setAttribute("data-theme", isLight ? "dark" : "light");
        themeBtn.textContent = isLight ? "☀ Light Mode" : "☾ Dark Mode";
        window.DashboardCharts.refreshTheme();
        refreshComparatorView();
      });
    }

    const exportBtn = document.getElementById("exportCsvBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", exportCountriesCsv);
    }

    const methBtn = document.getElementById("methodologyBtn");
    const methModal = document.getElementById("methodologyModalBackdrop");
    if (methBtn && methModal) {
      methBtn.addEventListener("click", () => methModal.classList.add("open"));
    }

    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.target === el) {
          document.querySelectorAll(".modal-backdrop").forEach((m) => m.classList.remove("open"));
        }
      });
    });
  }

  return {
    init() {
      window.DashboardCharts.initAll();
      renderArchetypeSummaryCards();
      initNationComparator();
      renderNationsDossierCards();
      renderCompressionList();
      renderCountryTable();
      initScenarioSimulator();
      bindEvents();
      updateYearState(25);
    },
    openCountryModal
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  window.DashboardApp.init();
});
