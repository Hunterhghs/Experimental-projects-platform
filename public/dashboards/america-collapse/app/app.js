/* ============================================================================
 * 21st-Century American Demographic Transformation Observatory
 * Primary Data: U.S. Census Bureau PEP (2000-2024) & 2023-2100 Scenarios
 * Analytical Frameworks: Hughes (2026) HH-2026-49, Zenodo 23596797 & 23200964
 * ============================================================================ */

const TIMELINE_YEARS = [2000, 2005, 2010, 2015, 2020, 2024, 2030, 2040, 2050, 2060, 2075, 2100];

// National U.S. Census Bureau calibrated trajectories [tot(M), nhw%, hisp%, nhb%, nha%, multiracial_other%]
const NATIONAL_SCENARIOS = {
  main: {
    label: "Main Scenario",
    crossover: 2049,
    years: {
      2025: { pop: 341.4, shares: [57.1, 20.2, 12.1, 6.6, 4.0] },
      2030: { pop: 347.5, shares: [55.5, 21.3, 12.2, 7.0, 4.0] },
      2040: { pop: 358.2, shares: [52.4, 23.2, 12.4, 7.7, 4.3] },
      2050: { pop: 365.8, shares: [49.5, 24.9, 12.6, 8.3, 4.7] },
      2060: { pop: 369.4, shares: [46.8, 26.5, 12.8, 8.9, 5.0] },
      2075: { pop: 369.0, shares: [43.2, 28.4, 13.0, 9.7, 5.7] },
      2100: { pop: 366.0, shares: [39.0, 30.6, 13.2, 10.6, 6.6] }
    }
  },
  high: {
    label: "High Immigration",
    crossover: 2045,
    years: {
      2025: { pop: 342.1, shares: [56.9, 20.3, 12.1, 6.7, 4.0] },
      2030: { pop: 351.2, shares: [54.9, 21.7, 12.2, 7.2, 4.0] },
      2040: { pop: 366.8, shares: [51.3, 23.9, 12.4, 8.0, 4.4] },
      2050: { pop: 380.4, shares: [48.1, 25.8, 12.6, 8.7, 4.8] },
      2060: { pop: 391.2, shares: [45.1, 27.5, 12.8, 9.4, 5.2] },
      2075: { pop: 400.5, shares: [41.1, 29.6, 12.9, 10.4, 6.0] },
      2100: { pop: 404.2, shares: [36.4, 32.0, 13.1, 11.5, 7.0] }
    }
  },
  low: {
    label: "Low Immigration",
    crossover: 2053,
    years: {
      2025: { pop: 340.7, shares: [57.2, 20.1, 12.1, 6.6, 4.0] },
      2030: { pop: 344.2, shares: [56.1, 20.9, 12.2, 6.8, 4.0] },
      2040: { pop: 349.8, shares: [53.4, 22.5, 12.4, 7.4, 4.3] },
      2050: { pop: 351.6, shares: [50.8, 24.0, 12.6, 7.9, 4.7] },
      2060: { pop: 349.0, shares: [48.5, 25.4, 12.8, 8.4, 4.9] },
      2075: { pop: 341.5, shares: [45.4, 27.1, 13.0, 9.0, 5.5] },
      2100: { pop: 331.8, shares: [42.1, 28.9, 13.2, 9.6, 6.2] }
    }
  },
  zero: {
    label: "Zero Immigration",
    crossover: 2063,
    years: {
      2025: { pop: 339.9, shares: [57.4, 20.0, 12.1, 6.5, 4.0] },
      2030: { pop: 340.6, shares: [56.7, 20.5, 12.2, 6.6, 4.0] },
      2040: { pop: 339.2, shares: [54.6, 21.8, 12.5, 6.9, 4.2] },
      2050: { pop: 334.0, shares: [52.1, 23.2, 12.7, 7.3, 4.7] },
      2060: { pop: 324.8, shares: [50.4, 24.3, 12.9, 7.5, 4.9] },
      2075: { pop: 310.2, shares: [47.8, 25.8, 13.1, 7.9, 5.4] },
      2100: { pop: 295.0, shares: [45.2, 27.3, 13.3, 8.2, 6.0] }
    }
  }
};

// Major Urban Cultural Epicenters (including NYC 5-borough aggregate & Census 2020 notes)
const CULTURAL_EPICENTERS = [
  {
    id: "NYC",
    name: "New York City (5 Boroughs)",
    state: "New York",
    fipsList: ["36061", "36047", "36081", "36005", "36085"],
    primaryFips: "36061",
    census2020Note: "30.9% NHW (2020 Census)"
  },
  {
    id: "42101",
    name: "Philadelphia (Philadelphia County)",
    state: "Pennsylvania",
    fipsList: ["42101"],
    primaryFips: "42101",
    census2020Note: "34.4% NHW (2020 Census)"
  },
  {
    id: "11001",
    name: "Washington, D.C. (District of Columbia)",
    state: "District of Columbia",
    fipsList: ["11001"],
    primaryFips: "11001",
    census2020Note: "38.0% NHW (2020 Census)"
  },
  {
    id: "06037",
    name: "Los Angeles (Los Angeles County)",
    state: "California",
    fipsList: ["06037"],
    primaryFips: "06037",
    census2020Note: "25.6% NHW (2020 Census)"
  },
  {
    id: "48201",
    name: "Houston (Harris County)",
    state: "Texas",
    fipsList: ["48201"],
    primaryFips: "48201",
    census2020Note: "27.7% NHW (2020 Census)"
  },
  {
    id: "12086",
    name: "Miami (Miami-Dade County)",
    state: "Florida",
    fipsList: ["12086"],
    primaryFips: "12086",
    census2020Note: "13.4% NHW (2020 Census)"
  },
  {
    id: "17031",
    name: "Chicago (Cook County)",
    state: "Illinois",
    fipsList: ["17031"],
    primaryFips: "17031",
    census2020Note: "40.6% NHW (2020 Census)"
  },
  {
    id: "48113",
    name: "Dallas (Dallas County)",
    state: "Texas",
    fipsList: ["48113"],
    primaryFips: "48113",
    census2020Note: "27.5% NHW (2020 Census)"
  },
  {
    id: "13121",
    name: "Atlanta (Fulton County)",
    state: "Georgia",
    fipsList: ["13121"],
    primaryFips: "13121",
    census2020Note: "39.1% NHW (2020 Census)"
  },
  {
    id: "04013",
    name: "Phoenix (Maricopa County)",
    state: "Arizona",
    fipsList: ["04013"],
    primaryFips: "04013",
    census2020Note: "53.3% NHW (2020 Census)"
  }
];

// Nuclear Family Historical Series (U.S. Census CPS & CDC NCHS 1960-2024)
const FAMILY_SERIES = [
  { year: 1960, marriedKids: 44.2, marriedNoKids: 30.3, singlePerson: 13.1, singleParent: 4.4, nonMaritalBirths: 5.3 },
  { year: 1970, marriedKids: 40.3, marriedNoKids: 30.3, singlePerson: 17.1, singleParent: 5.6, nonMaritalBirths: 10.7 },
  { year: 1980, marriedKids: 30.9, marriedNoKids: 29.9, singlePerson: 22.7, singleParent: 7.5, nonMaritalBirths: 18.4 },
  { year: 1990, marriedKids: 26.3, marriedNoKids: 29.8, singlePerson: 24.6, singleParent: 8.3, nonMaritalBirths: 28.0 },
  { year: 2000, marriedKids: 23.5, marriedNoKids: 28.2, singlePerson: 25.8, singleParent: 9.1, nonMaritalBirths: 33.2 },
  { year: 2010, marriedKids: 20.2, marriedNoKids: 28.2, singlePerson: 26.7, singleParent: 9.6, nonMaritalBirths: 40.8 },
  { year: 2020, marriedKids: 18.4, marriedNoKids: 29.0, singlePerson: 28.3, singleParent: 8.9, nonMaritalBirths: 40.5 },
  { year: 2024, marriedKids: 17.6, marriedNoKids: 28.9, singlePerson: 29.0, singleParent: 8.6, nonMaritalBirths: 40.0 }
];

const TFR_SERIES = [
  { year: 1990, total: 2.08, nhw: 1.85, hisp: 2.96, nhb: 2.55, nha: 2.00 },
  { year: 1995, total: 1.98, nhw: 1.78, hisp: 2.80, nhb: 2.20, nha: 1.80 },
  { year: 2000, total: 2.06, nhw: 1.87, hisp: 2.73, nhb: 2.13, nha: 1.89 },
  { year: 2007, total: 2.12, nhw: 1.91, hisp: 2.84, nhb: 2.14, nha: 1.92 },
  { year: 2010, total: 1.93, nhw: 1.79, hisp: 2.35, nhb: 1.97, nha: 1.69 },
  { year: 2015, total: 1.84, nhw: 1.75, hisp: 2.12, nhb: 1.85, nha: 1.64 },
  { year: 2020, total: 1.64, nhw: 1.55, hisp: 1.88, nhb: 1.71, nha: 1.39 },
  { year: 2024, total: 1.62, nhw: 1.53, hisp: 1.88, nhb: 1.60, nha: 1.42 }
];

const BLENDING_SERIES = [
  { year: 1970, intermarriageNew: 3.0, multiracialPopPct: 0.8 },
  { year: 1980, intermarriageNew: 6.7, multiracialPopPct: 1.2 },
  { year: 1990, intermarriageNew: 9.6, multiracialPopPct: 1.8 },
  { year: 2000, intermarriageNew: 14.6, multiracialPopPct: 2.4 },
  { year: 2010, intermarriageNew: 15.5, multiracialPopPct: 2.9 },
  { year: 2020, intermarriageNew: 19.0, multiracialPopPct: 10.2 },
  { year: 2035, intermarriageNew: 23.5, multiracialPopPct: 13.8 },
  { year: 2050, intermarriageNew: 28.0, multiracialPopPct: 17.5 }
];

const POSTPEAK_SERIES = [
  { year: 1820, westGDP: 28.0, westPop: 20.8 },
  { year: 1870, westGDP: 46.5, westPop: 25.4 },
  { year: 1913, westGDP: 56.2, westPop: 30.1 },
  { year: 1950, westGDP: 57.0, westPop: 28.8 },
  { year: 1973, westGDP: 50.8, westPop: 22.9 },
  { year: 2000, westGDP: 43.2, westPop: 16.9 },
  { year: 2024, westGDP: 31.0, westPop: 13.8 },
  { year: 2050, westGDP: 23.5, westPop: 12.1 },
  { year: 2100, westGDP: 18.0, westPop: 10.5 }
];

const GROUP_COLORS = {
  nhWhite: "#5b9bd5",
  hispanic: "#e0a958",
  nhBlack: "#9b7ede",
  nhAsianPI: "#3fb8af",
  nhOtherMulti: "#e2645a"
};

const GROUP_LABELS = [
  { key: "nhWhite", idx: 1, name: "Non-Hispanic White", color: GROUP_COLORS.nhWhite },
  { key: "hispanic", idx: 2, name: "Hispanic / Latino", color: GROUP_COLORS.hispanic },
  { key: "nhBlack", idx: 3, name: "Non-Hispanic Black", color: GROUP_COLORS.nhBlack },
  { key: "nhAsianPI", idx: 4, name: "NH Asian & Pacific Isl.", color: GROUP_COLORS.nhAsianPI },
  { key: "nhOtherMulti", idx: 5, name: "Multiracial / Native / Other", color: GROUP_COLORS.nhOtherMulti }
];

// App State
const state = {
  topo: null,
  demo: null,
  yearIndex: 5, // 2024
  metric: "nhw_share",
  scenario: "main",
  stateFilter: "ALL",
  mmOnly: false,
  showPins: true,
  selectedFips: null, // null = National, "NYC" = 5 boroughs, 2-digit = state, 5-digit = county
  familyTab: "households",
  projTab: "scenarios",
  playTimer: null
};

// Formatters
const fmtInt = d3.format(",");
const fmtPct = d => `${d.toFixed(1)}%`;

// Compute county vector [tot, nhw, hisp, nhb, nha, nho] for any year (2000..2100) and scenario
function getCountyVector(fips, year, scenarioKey = state.scenario) {
  const c = state.demo.counties[fips];
  if (!c) return [0, 0, 0, 0, 0, 0];
  if (year <= 2024 && c.y[String(year)]) {
    return c.y[String(year)];
  }
  // Project from 2024 using county's 2010->2024 structural velocity + national scenario calibration
  const v2024 = c.y["2024"];
  const v2010 = c.y["2010"] || c.y["2000"];
  const tot24 = v2024[0] || 1;
  const tot10 = v2010[0] || 1;

  const nhw24 = v2024[1] / tot24;
  const nhw10 = v2010[1] / tot10;
  // County youth NHW share (generational replacement signal)
  const k24 = c.k && c.k["2024"] && c.k["2024"][0] > 0 ? c.k["2024"][1] / c.k["2024"][0] : nhw24 * 0.85;
  const youthGap = Math.max(-0.15, Math.min(0.25, nhw24 - k24)); // higher when youth are much more diverse than elders

  const annualShiftObs = (nhw24 - nhw10) / 14; // typically negative
  const nat24 = NATIONAL_SCENARIOS.main.years[2025].shares[0] / 100;
  const natTarget = NATIONAL_SCENARIOS[scenarioKey].years[year].shares[0] / 100;
  const natDrop = nat24 - natTarget; // positive number (e.g., 0.181 by 2100)

  const dt = year - 2024;
  const damping = Math.exp(-0.012 * dt);
  // Combine national scenario drift + county empirical trend + youth cohort momentum
  const localMultiplier = 0.65 + 0.35 * Math.min(2.2, Math.max(0.35, (-annualShiftObs / 0.0046) * 0.7 + (youthGap / 0.10) * 0.3));
  const projectedNhwShare = Math.max(0.02, Math.min(0.97, nhw24 * Math.exp(-natDrop * localMultiplier * (1.05 - 0.15 * damping) / Math.max(0.18, nat24))));

  // Population growth scaled to national scenario
  const popGrowth14 = Math.max(-0.22, Math.min(0.45, (tot24 - tot10) / tot10));
  const natPopFactor = NATIONAL_SCENARIOS[scenarioKey].years[year].pop / 340.11;
  const projTot = Math.max(50, Math.round(tot24 * natPopFactor * Math.pow(1 + popGrowth14 / 14, dt * 0.38)));

  const projNhw = Math.round(projTot * projectedNhwShare);
  const remProj = Math.max(0, projTot - projNhw);
  const rem24 = Math.max(1, tot24 - v2024[1]);

  // Distribute non-NHW groups with slight boost to Hispanic, Asian, and Multiracial
  const wHisp = (v2024[2] / rem24) * (1 + 0.0015 * dt);
  const wBlack = (v2024[3] / rem24) * (1 - 0.001 * dt);
  const wAsian = (v2024[4] / rem24) * (1 + 0.0035 * dt);
  const wOther = Math.max(0.03, v2024[5] / rem24) * (1 + 0.006 * dt);
  const wSum = wHisp + wBlack + wAsian + wOther || 1;

  return [
    projTot,
    projNhw,
    Math.round(remProj * (wHisp / wSum)),
    Math.round(remProj * (wBlack / wSum)),
    Math.round(remProj * (wAsian / wSum)),
    Math.round(remProj * (wOther / wSum))
  ];
}

function getNationalVector(year, scenarioKey = state.scenario) {
  if (year <= 2024 && state.demo.national[String(year)]) {
    return state.demo.national[String(year)];
  }
  const sc = NATIONAL_SCENARIOS[scenarioKey].years[year];
  const tot = Math.round(sc.pop * 1e6);
  return [
    tot,
    Math.round(tot * sc.shares[0] / 100),
    Math.round(tot * sc.shares[1] / 100),
    Math.round(tot * sc.shares[2] / 100),
    Math.round(tot * sc.shares[3] / 100),
    Math.round(tot * sc.shares[4] / 100)
  ];
}

function getAggregateVector(fipsList, year, scenarioKey = state.scenario) {
  const sum = [0, 0, 0, 0, 0, 0];
  for (const f of fipsList) {
    const v = getCountyVector(f, year, scenarioKey);
    for (let i = 0; i < 6; i++) sum[i] += v[i];
  }
  return sum;
}

function calcDiversityIndex(vec) {
  const tot = vec[0] || 1;
  let sumSq = 0;
  for (let i = 1; i <= 5; i++) {
    const p = vec[i] / tot;
    sumSq += p * p;
  }
  return 1 - sumSq;
}

function getCountyKidsNhwPct(fips, year) {
  const c = state.demo.counties[fips];
  if (!c) return 50;
  const v = getCountyVector(fips, year);
  const totNhwPct = (100 * v[1]) / (v[0] || 1);
  if (year <= 2024 && c.k) {
    const k24 = c.k["2024"] ? (100 * c.k["2024"][1]) / (c.k["2024"][0] || 1) : totNhwPct * 0.85;
    const k10 = c.k["2010"] ? (100 * c.k["2010"][1]) / (c.k["2010"][0] || 1) : k24 + 5;
    if (year <= 2010) return Math.min(99, k10 + (2010 - year) * 0.35);
    const t = (year - 2010) / 14;
    return k10 + t * (k24 - k10);
  }
  return Math.max(1.5, totNhwPct * 0.83);
}

function getLargestGroup(vec) {
  let bestIdx = 1;
  let bestVal = vec[1];
  for (let i = 2; i <= 5; i++) {
    if (vec[i] > bestVal) {
      bestVal = vec[i];
      bestIdx = i;
    }
  }
  return GROUP_LABELS[bestIdx - 1];
}

// ============================================================================
// Initialization
// ============================================================================
Promise.all([
  d3.json("data/counties-10m.json"),
  d3.json("data/demographics.json")
]).then(([topo, demo]) => {
  state.topo = topo;
  state.demo = demo;

  initControls();
  initMap();
  updateAll();
  renderFamilyChart();
  renderProjectionChart();
  renderCenturyTable();
  renderEpicentersTable();
  initPactSimulator();
  renderPostPeakChart();
});

function initControls() {
  // Populate State Filter
  const stSelect = document.getElementById("state-filter");
  const statesSorted = Object.entries(state.demo.states)
    .map(([code, obj]) => ({ code, name: obj.n }))
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const s of statesSorted) {
    const opt = document.createElement("option");
    opt.value = s.code;
    opt.textContent = s.name;
    stSelect.appendChild(opt);
  }

  // Year ticks
  const ticksEl = document.getElementById("year-ticks");
  TIMELINE_YEARS.forEach((yr, idx) => {
    const sp = document.createElement("span");
    sp.textContent = yr;
    sp.addEventListener("click", () => {
      state.yearIndex = idx;
      document.getElementById("year-slider").value = idx;
      updateAll();
    });
    ticksEl.appendChild(sp);
  });

  document.getElementById("year-slider").addEventListener("input", e => {
    state.yearIndex = +e.target.value;
    updateAll();
  });

  document.getElementById("metric-select").addEventListener("change", e => {
    state.metric = e.target.value;
    updateAll();
  });

  document.getElementById("scenario-select").addEventListener("change", e => {
    state.scenario = e.target.value;
    updateAll();
    renderProjectionChart();
  });

  stSelect.addEventListener("change", e => {
    state.stateFilter = e.target.value;
    state.selectedFips = e.target.value === "ALL" ? null : e.target.value;
    updateAll();
  });

  document.getElementById("btn-mm-only").addEventListener("click", e => {
    state.mmOnly = !state.mmOnly;
    e.currentTarget.classList.toggle("active", state.mmOnly);
    updateMapColors();
  });

  document.getElementById("btn-pins").addEventListener("click", e => {
    state.showPins = !state.showPins;
    e.currentTarget.classList.toggle("active", state.showPins);
    d3.select("#pins-layer").style("display", state.showPins ? null : "none");
  });

  document.getElementById("btn-reset-selection").addEventListener("click", () => {
    state.selectedFips = null;
    state.stateFilter = "ALL";
    document.getElementById("state-filter").value = "ALL";
    updateAll();
  });

  // Search box
  const searchInput = document.getElementById("county-search");
  searchInput.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;
    if (q.includes("new york city") || q === "nyc") {
      state.selectedFips = "NYC";
      updateAll();
      return;
    }
    const match = Object.entries(state.demo.counties).find(([f, c]) =>
      `${c.n}, ${c.s}`.toLowerCase().includes(q)
    );
    if (match) {
      state.selectedFips = match[0];
      updateAll();
    }
  });

  // Play timeline button
  const playBtn = document.getElementById("btn-play");
  playBtn.addEventListener("click", () => {
    if (state.playTimer) {
      clearInterval(state.playTimer);
      state.playTimer = null;
      playBtn.innerHTML = "&#9654; Play";
      return;
    }
    playBtn.innerHTML = "&#9632; Pause";
    state.playTimer = setInterval(() => {
      state.yearIndex = (state.yearIndex + 1) % TIMELINE_YEARS.length;
      document.getElementById("year-slider").value = state.yearIndex;
      updateAll();
    }, 1100);
  });

  // Family tabs
  document.querySelectorAll(".fam-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fam-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.familyTab = btn.dataset.tab;
      renderFamilyChart();
    });
  });

  // Projection tabs
  document.querySelectorAll(".proj-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".proj-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.projTab = btn.dataset.tab;
      renderProjectionChart();
    });
  });

  // Theory tabs
  document.querySelectorAll(".theory-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".theory-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.getElementById("pact-view").style.display = tab === "pact" ? "block" : "none";
      document.getElementById("postpeak-view").style.display = tab === "postpeak" ? "block" : "none";
    });
  });
}

// ============================================================================
// Cartographic Map
// ============================================================================
let svgMap, gMap, pathGen, zoomBehavior;

function initMap() {
  svgMap = d3.select("#us-map");
  gMap = svgMap.append("g").attr("class", "map-root");
  pathGen = d3.geoPath();

  const countiesGeo = topojson.feature(state.topo, state.topo.objects.counties).features;
  const statesMesh = topojson.mesh(state.topo, state.topo.objects.states, (a, b) => a !== b);

  gMap.append("g")
    .attr("id", "counties-layer")
    .selectAll("path")
    .data(countiesGeo, d => d.id)
    .join("path")
    .attr("class", "county-path")
    .attr("d", pathGen)
    .on("mousemove", (event, d) => showCountyTooltip(event, d.id))
    .on("mouseleave", hideTooltip)
    .on("click", (event, d) => {
      event.stopPropagation();
      state.selectedFips = d.id;
      updateAll();
    });

  gMap.append("path")
    .datum(statesMesh)
    .attr("class", "state-mesh")
    .attr("d", pathGen);

  // Metro Epicenter Pins
  const pinsLayer = gMap.append("g").attr("id", "pins-layer");
  const featureById = new Map(countiesGeo.map(f => [f.id, f]));

  const pinData = CULTURAL_EPICENTERS.map(ep => {
    const feat = featureById.get(ep.primaryFips);
    const centroid = feat ? pathGen.centroid(feat) : null;
    return { ...ep, centroid };
  }).filter(d => d.centroid && !isNaN(d.centroid[0]));

  const pinGroups = pinsLayer.selectAll("g.epicenter-pin")
    .data(pinData)
    .join("g")
    .attr("class", "epicenter-pin")
    .attr("transform", d => `translate(${d.centroid[0]},${d.centroid[1]})`)
    .on("click", (event, d) => {
      event.stopPropagation();
      state.selectedFips = d.id;
      updateAll();
    });

  pinGroups.append("circle").attr("r", 5.5);
  pinGroups.append("text")
    .attr("x", 8)
    .attr("y", 3)
    .text(d => d.name.split(" (")[0]);

  zoomBehavior = d3.zoom()
    .scaleExtent([1, 12])
    .on("zoom", event => {
      gMap.attr("transform", event.transform);
    });

  svgMap.call(zoomBehavior);

  document.getElementById("zoom-in").addEventListener("click", () => {
    svgMap.transition().duration(250).call(zoomBehavior.scaleBy, 1.45);
  });
  document.getElementById("zoom-out").addEventListener("click", () => {
    svgMap.transition().duration(250).call(zoomBehavior.scaleBy, 1 / 1.45);
  });
  document.getElementById("zoom-reset").addEventListener("click", () => {
    svgMap.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
  });
}

function getColorScale(metric) {
  if (metric === "nhw_share" || metric === "kids_nhw") {
    // Diverging around 50% threshold: warm terracotta/amber (<50% majority-minority) -> slate -> cool steel/blue (>50% NHW)
    return d3.scaleDiverging()
      .domain([10, 50, 92])
      .interpolator(t => d3.interpolateRdYlBu(t))
      .clamp(true);
  }
  if (metric === "nhw_shift") {
    // Change in pp from 2000: -30pp (steep decline) to 0pp
    return d3.scaleSequential()
      .domain([-28, 2])
      .interpolator(d3.interpolateYlOrRd)
      .clamp(true);
  }
  if (metric === "diversity") {
    return d3.scaleSequential()
      .domain([0.10, 0.76])
      .interpolator(d3.interpolateViridis)
      .clamp(true);
  }
  return null;
}

function updateMapColors() {
  const year = TIMELINE_YEARS[state.yearIndex];
  const metric = state.metric;
  const scale = getColorScale(metric);

  let mmCount = 0;
  let mmPop = 0;
  let totPop = 0;

  for (const fips of Object.keys(state.demo.counties)) {
    const v = getCountyVector(fips, year);
    const nhwPct = (100 * v[1]) / (v[0] || 1);
    totPop += v[0];
    if (nhwPct < 50) {
      mmCount++;
      mmPop += v[0];
    }
  }

  d3.select("#counties-layer").selectAll("path.county-path")
    .attr("fill", d => {
      const fips = d.id;
      const v = getCountyVector(fips, year);
      if (!v || !v[0]) return "#222";
      const nhwPct = (100 * v[1]) / v[0];

      if (metric === "nhw_share") return scale(nhwPct);
      if (metric === "kids_nhw") return scale(getCountyKidsNhwPct(fips, year));
      if (metric === "nhw_shift") {
        const v00 = getCountyVector(fips, 2000);
        const shift = nhwPct - (100 * v00[1]) / (v00[0] || 1);
        return d3.interpolateYlOrRd(Math.min(1, Math.max(0, -shift / 28)));
      }
      if (metric === "diversity") return scale(calcDiversityIndex(v));
      if (metric === "plurality") return getLargestGroup(v).color;
      return "#444";
    })
    .classed("selected", d => {
      if (state.selectedFips === "NYC") {
        return ["36061", "36047", "36081", "36005", "36085"].includes(d.id);
      }
      return d.id === state.selectedFips;
    })
    .classed("dimmed", d => {
      const fips = d.id;
      if (state.stateFilter !== "ALL" && !fips.startsWith(state.stateFilter)) return true;
      if (state.mmOnly) {
        const v = getCountyVector(fips, year);
        const nhwPct = (100 * v[1]) / (v[0] || 1);
        if (nhwPct >= 50) return true;
      }
      return false;
    });

  // Update KPI and summary caption
  document.getElementById("kpi-mm-counties").innerHTML =
    `${fmtInt(mmCount)} <span style="font-size:13px;font-weight:400;color:var(--text-2)">/ 3,142</span>`;
  document.getElementById("map-summary-caption").innerHTML =
    `In <strong>${year}</strong> (${year <= 2024 ? "Census Observed" : NATIONAL_SCENARIOS[state.scenario].label}): <strong>${fmtInt(mmCount)} counties</strong> (&lt;50% NH White) hold <strong>${((100 * mmPop) / (totPop || 1)).toFixed(1)}%</strong> of the U.S. population.`;

  renderLegend(metric);
}

function renderLegend(metric) {
  const container = document.getElementById("map-legend");
  container.innerHTML = "";

  if (metric === "plurality") {
    for (const g of GROUP_LABELS) {
      const item = document.createElement("span");
      item.className = "swatch-item";
      item.innerHTML = `<span class="swatch" style="background:${g.color}"></span>${g.name}`;
      container.appendChild(item);
    }
    return;
  }

  let grad = "";
  let labels = [];
  if (metric === "nhw_share" || metric === "kids_nhw") {
    grad = "linear-gradient(90deg, #a50026 0%, #f46d43 25%, #ffffbf 50%, #74add1 75%, #313695 100%)";
    labels = ["10% (Majority-Minority)", "30%", "50% Threshold", "70%", "90%+ NH White"];
  } else if (metric === "nhw_shift") {
    grad = "linear-gradient(90deg, #ffffcc 0%, #fd8d3c 50%, #800026 100%)";
    labels = ["0 pp (Stable)", "-14 pp", "-28+ pp NHW Decline"];
  } else if (metric === "diversity") {
    grad = "linear-gradient(90deg, #440154 0%, #21918c 50%, #fde725 100%)";
    labels = ["0.10 (Homogeneous)", "0.45", "0.75+ (High Ethnic Blending)"];
  }

  container.innerHTML = `
    <div class="legend-bar" style="background:${grad}"></div>
    <div class="legend-labels">${labels.map(l => `<span>${l}</span>`).join(" &bull; ")}</div>
  `;
}

function showCountyTooltip(event, fips) {
  const c = state.demo.counties[fips];
  if (!c) return;
  const year = TIMELINE_YEARS[state.yearIndex];
  const v = getCountyVector(fips, year);
  const v00 = getCountyVector(fips, 2000);
  const nhwPct = (100 * v[1]) / (v[0] || 1);
  const nhw00 = (100 * v00[1]) / (v00[0] || 1);
  const shift = nhwPct - nhw00;
  const kidsPct = getCountyKidsNhwPct(fips, year);
  const topGrp = getLargestGroup(v);

  const tt = document.getElementById("map-tooltip");
  tt.style.display = "block";
  tt.style.left = `${Math.min(window.innerWidth - 260, event.clientX + 14)}px`;
  tt.style.top = `${Math.min(window.innerHeight - 190, event.clientY + 14)}px`;
  tt.innerHTML = `
    <div class="tt-title">${c.n}, ${c.s} <span style="color:var(--accent);font-family:var(--font-mono);">(${year})</span></div>
    <div class="tt-row"><span>Total Population:</span><span class="tt-val">${fmtInt(v[0])}</span></div>
    <div class="tt-row"><span>NH White Share:</span><span class="tt-val" style="color:${nhwPct < 50 ? '#ff8b82' : '#8bc2f2'}">${nhwPct.toFixed(1)}%</span></div>
    <div class="tt-row"><span>Shift Since 2000:</span><span class="tt-val">${shift >= 0 ? "+" : ""}${shift.toFixed(1)} pp</span></div>
    <div class="tt-row"><span>Youth (&lt;15) NHW Share:</span><span class="tt-val">${kidsPct.toFixed(1)}%</span></div>
    <div class="tt-row"><span>Hispanic / NH Black / Asian:</span><span class="tt-val">${((100*v[2])/v[0]).toFixed(1)}% / ${((100*v[3])/v[0]).toFixed(1)}% / ${((100*v[4])/v[0]).toFixed(1)}%</span></div>
    <div class="tt-row"><span>Plurality Group:</span><span class="tt-val" style="color:${topGrp.color}">${topGrp.name}</span></div>
  `;
}

function hideTooltip() {
  document.getElementById("map-tooltip").style.display = "none";
}

// ============================================================================
// Inspector Sidebar & Master Update
// ============================================================================
function updateAll() {
  const year = TIMELINE_YEARS[state.yearIndex];
  document.getElementById("year-display").textContent = year;
  document.getElementById("year-mode-tag").textContent =
    year <= 2024 ? "Census Observed" : `Projected · ${NATIONAL_SCENARIOS[state.scenario].label}`;
  document.getElementById("kpi-crossover").textContent = `~${NATIONAL_SCENARIOS[state.scenario].crossover}`;

  updateMapColors();
  updateInspector();
}

function getSelectedSeriesDescriptor() {
  const sel = state.selectedFips;
  if (!sel) {
    return {
      title: "United States (National Total)",
      subtitle: `3,142 Counties · ${NATIONAL_SCENARIOS[state.scenario].label}`,
      getVec: yr => getNationalVector(yr, state.scenario),
      getKidsPct: yr => {
        if (yr <= 2024 && state.demo.nationalKids[String(yr)]) {
          const k = state.demo.nationalKids[String(yr)];
          return (100 * k[1]) / (k[0] || 1);
        }
        const v = getNationalVector(yr, state.scenario);
        return ((100 * v[1]) / v[0]) * 0.82;
      }
    };
  }
  if (sel === "NYC") {
    const fipsList = ["36061", "36047", "36081", "36005", "36085"];
    return {
      title: "New York City (5 Boroughs Aggregate)",
      subtitle: "Bronx, Kings, New York, Queens & Richmond Counties, NY · 30.9% NHW in 2020 Census",
      getVec: yr => getAggregateVector(fipsList, yr, state.scenario),
      getKidsPct: yr => {
        const v = getAggregateVector(fipsList, yr, state.scenario);
        return ((100 * v[1]) / v[0]) * 0.80;
      }
    };
  }
  if (sel.length === 2 && state.demo.states[sel]) {
    const st = state.demo.states[sel];
    const fipsList = Object.keys(state.demo.counties).filter(f => f.startsWith(sel));
    return {
      title: `${st.n} (State Total)`,
      subtitle: `${fipsList.length} Counties · FIPS ${sel}`,
      getVec: yr => getAggregateVector(fipsList, yr, state.scenario),
      getKidsPct: yr => {
        if (yr <= 2024 && st.k && st.k[String(yr)]) {
          return (100 * st.k[String(yr)][1]) / (st.k[String(yr)][0] || 1);
        }
        const v = getAggregateVector(fipsList, yr, state.scenario);
        return ((100 * v[1]) / v[0]) * 0.82;
      }
    };
  }
  const c = state.demo.counties[sel];
  return {
    title: `${c.n}, ${c.s}`,
    subtitle: `County FIPS ${sel}`,
    getVec: yr => getCountyVector(sel, yr, state.scenario),
    getKidsPct: yr => getCountyKidsNhwPct(sel, yr)
  };
}

function updateInspector() {
  const year = TIMELINE_YEARS[state.yearIndex];
  const desc = getSelectedSeriesDescriptor();
  const v = desc.getVec(year);
  const v00 = desc.getVec(2000);
  const tot = v[0] || 1;
  const nhwPct = (100 * v[1]) / tot;
  const nhw00 = (100 * v00[1]) / (v00[0] || 1);
  const shift = nhwPct - nhw00;
  const kidsPct = desc.getKidsPct(year);
  const divIdx = calcDiversityIndex(v);

  document.getElementById("insp-title").textContent = desc.title;
  document.getElementById("insp-subtitle").textContent = `${desc.subtitle} · Year ${year}`;
  document.getElementById("insp-pop").textContent = fmtInt(v[0]);
  document.getElementById("insp-nhw").textContent = `${nhwPct.toFixed(1)}%`;
  document.getElementById("insp-shift").textContent = `${shift >= 0 ? "+" : ""}${shift.toFixed(1)} pp`;
  document.getElementById("insp-kids").textContent = `${kidsPct.toFixed(1)}% / ${divIdx.toFixed(2)}`;

  const badge = document.getElementById("insp-status-badge");
  if (nhwPct < 50) {
    badge.className = "badge badge-mm";
    badge.textContent = "Majority-Minority (<50% NHW)";
  } else {
    badge.className = "badge badge-maj";
    badge.textContent = "Majority NH White (≥50%)";
  }

  // Composition bars
  const barsEl = document.getElementById("insp-bars");
  barsEl.innerHTML = GROUP_LABELS.map(g => {
    const count = v[g.idx];
    const pct = (100 * count) / tot;
    return `
      <div class="comp-row">
        <div class="comp-row-top">
          <span>${g.name}</span>
          <span class="mono">${pct.toFixed(1)}% (${fmtInt(count)})</span>
        </div>
        <div class="comp-track">
          <div class="comp-fill" style="width:${Math.min(100, pct)}%;background:${g.color}"></div>
        </div>
      </div>
    `;
  }).join("");

  renderInspectorTrajectory(desc, year);
}

function renderInspectorTrajectory(desc, activeYear) {
  const svg = d3.select("#insp-trend-svg");
  svg.selectAll("*").remove();

  const W = 360, H = 175, m = { t: 14, r: 16, b: 24, l: 34 };
  const series = TIMELINE_YEARS.map(yr => {
    const v = desc.getVec(yr);
    const t = v[0] || 1;
    return {
      year: yr,
      nhw: (100 * v[1]) / t,
      hisp: (100 * v[2]) / t,
      nonNhw: 100 - (100 * v[1]) / t
    };
  });

  const x = d3.scaleLinear().domain([2000, 2100]).range([m.l, W - m.r]);
  const y = d3.scaleLinear().domain([0, 100]).range([H - m.b, m.t]);

  svg.append("g")
    .attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).tickValues([2000, 2024, 2050, 2075, 2100]).tickFormat(d3.format("d")))
    .attr("color", "#7f8a9c");

  svg.append("g")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}%`))
    .attr("color", "#7f8a9c");

  // 50% threshold line
  svg.append("line")
    .attr("x1", m.l).attr("x2", W - m.r)
    .attr("y1", y(50)).attr("y2", y(50))
    .attr("stroke", "#e2645a")
    .attr("stroke-dasharray", "4,3")
    .attr("stroke-width", 1.1);

  svg.append("text")
    .attr("x", W - m.r - 4)
    .attr("y", y(50) - 4)
    .attr("text-anchor", "end")
    .attr("fill", "#ff8b82")
    .attr("font-size", 9.5)
    .text("50% Majority-Minority Threshold");

  const lineNhw = d3.line().x(d => x(d.year)).y(d => y(d.nhw));
  const lineHisp = d3.line().x(d => x(d.year)).y(d => y(d.hisp));

  svg.append("path")
    .datum(series)
    .attr("fill", "none")
    .attr("stroke", GROUP_COLORS.nhWhite)
    .attr("stroke-width", 2.3)
    .attr("d", lineNhw);

  svg.append("path")
    .datum(series)
    .attr("fill", "none")
    .attr("stroke", GROUP_COLORS.hispanic)
    .attr("stroke-width", 1.8)
    .attr("d", lineHisp);

  // Active year marker
  svg.append("line")
    .attr("x1", x(activeYear)).attr("x2", x(activeYear))
    .attr("y1", m.t).attr("y2", H - m.b)
    .attr("stroke", "#ffffff")
    .attr("stroke-opacity", 0.45)
    .attr("stroke-dasharray", "2,2");
}

// ============================================================================
// Panel A: Dissolution of the Nuclear Family Chart
// ============================================================================
function renderFamilyChart() {
  const svg = d3.select("#family-chart-svg");
  svg.selectAll("*").remove();
  const W = 680, H = 285, m = { t: 22, r: 120, b: 32, l: 44 };

  if (state.familyTab === "households") {
    const x = d3.scaleLinear().domain([1960, 2024]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, 50]).range([H - m.b, m.t]);

    svg.append("g")
      .attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("color", "#8a95a7");

    svg.append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#8a95a7");

    const lines = [
      { key: "marriedKids", label: "Married w/ Children (Nuclear)", color: "#e0a958", width: 3 },
      { key: "nonMaritalBirths", label: "Non-Marital Share of Births", color: "#e2645a", width: 2.3 },
      { key: "singlePerson", label: "Single-Person Households", color: "#5b9bd5", width: 2.2 },
      { key: "singleParent", label: "Single-Parent Households", color: "#9b7ede", width: 1.8 }
    ];

    for (const ln of lines) {
      const gen = d3.line().x(d => x(d.year)).y(d => y(d[ln.key]));
      svg.append("path")
        .datum(FAMILY_SERIES)
        .attr("fill", "none")
        .attr("stroke", ln.color)
        .attr("stroke-width", ln.width)
        .attr("d", gen);

      const last = FAMILY_SERIES[FAMILY_SERIES.length - 1];
      svg.append("circle")
        .attr("cx", x(last.year))
        .attr("cy", y(last[ln.key]))
        .attr("r", 3.5)
        .attr("fill", ln.color);

      svg.append("text")
        .attr("x", x(last.year) + 7)
        .attr("y", y(last[ln.key]) + 4)
        .attr("fill", ln.color)
        .attr("font-size", 10.5)
        .attr("font-weight", 600)
        .text(`${last[ln.key]}% ${ln.label.split(" (")[0]}`);
    }
  } else {
    // Fertility Rate vs Replacement (2.10)
    const x = d3.scaleLinear().domain([1990, 2024]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([1.1, 3.1]).range([H - m.b, m.t]);

    svg.append("g")
      .attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("color", "#8a95a7");

    svg.append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .attr("color", "#8a95a7");

    // 2.10 Replacement Line
    svg.append("line")
      .attr("x1", m.l).attr("x2", W - m.r)
      .attr("y1", y(2.1)).attr("y2", y(2.1))
      .attr("stroke", "#e2645a")
      .attr("stroke-dasharray", "5,4")
      .attr("stroke-width", 1.4);

    svg.append("text")
      .attr("x", m.l + 8)
      .attr("y", y(2.1) - 6)
      .attr("fill", "#ff8b82")
      .attr("font-size", 10.5)
      .attr("font-weight", 600)
      .text("Replacement Level Fertility (TFR = 2.10)");

    const tfrLines = [
      { key: "hisp", label: "Hispanic (1.88)", color: GROUP_COLORS.hispanic },
      { key: "total", label: "U.S. Total (1.62)", color: "#ffffff" },
      { key: "nhb", label: "NH Black (1.60)", color: GROUP_COLORS.nhBlack },
      { key: "nhw", label: "NH White (1.53)", color: GROUP_COLORS.nhWhite },
      { key: "nha", label: "NH Asian (1.42)", color: GROUP_COLORS.nhAsianPI }
    ];

    tfrLines.forEach((ln, idx) => {
      const gen = d3.line().x(d => x(d.year)).y(d => y(d[ln.key]));
      svg.append("path")
        .datum(TFR_SERIES)
        .attr("fill", "none")
        .attr("stroke", ln.color)
        .attr("stroke-width", ln.key === "nhw" ? 2.8 : 2.0)
        .attr("d", gen);

      const last = TFR_SERIES[TFR_SERIES.length - 1];
      svg.append("text")
        .attr("x", x(last.year) + 6)
        .attr("y", y(last[ln.key]) + (idx === 2 ? -4 : idx === 3 ? 6 : 3))
        .attr("fill", ln.color)
        .attr("font-size", 10.5)
        .attr("font-weight", 600)
        .text(ln.label);
    });
  }
}

// ============================================================================
// Panel B: Century Projections (2000-2100) & Ethnic Blending
// ============================================================================
function renderProjectionChart() {
  const svg = d3.select("#proj-chart-svg");
  svg.selectAll("*").remove();
  const W = 680, H = 285, m = { t: 22, r: 130, b: 32, l: 44 };

  if (state.projTab === "scenarios") {
    const x = d3.scaleLinear().domain([2000, 2100]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([30, 75]).range([H - m.b, m.t]);

    svg.append("g")
      .attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("color", "#8a95a7");

    svg.append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}%`))
      .attr("color", "#8a95a7");

    // 50% threshold
    svg.append("line")
      .attr("x1", m.l).attr("x2", W - m.r)
      .attr("y1", y(50)).attr("y2", y(50))
      .attr("stroke", "#e2645a")
      .attr("stroke-dasharray", "5,3")
      .attr("stroke-width", 1.3);

    svg.append("text")
      .attr("x", m.l + 8)
      .attr("y", y(50) - 6)
      .attr("fill", "#ff8b82")
      .attr("font-size", 10.5)
      .text("50.0% Majority-Minority Threshold (Crossed ~2049 in Main Scenario)");

    const scConfigs = [
      { key: "zero", label: "Zero Immigration (45.2%)", color: "#6cc070", dash: "4,3" },
      { key: "low", label: "Low Immigration (42.1%)", color: "#3fb8af", dash: "2,2" },
      { key: "main", label: "Main Scenario (39.0%)", color: "#5b9bd5", dash: null },
      { key: "high", label: "High Immigration (36.4%)", color: "#e0a958", dash: "4,3" }
    ];

    for (const sc of scConfigs) {
      const pts = TIMELINE_YEARS.map(yr => {
        const v = getNationalVector(yr, sc.key);
        return { year: yr, pct: (100 * v[1]) / v[0] };
      });
      const gen = d3.line().x(d => x(d.year)).y(d => y(d.pct));
      svg.append("path")
        .datum(pts)
        .attr("fill", "none")
        .attr("stroke", sc.color)
        .attr("stroke-width", sc.key === state.scenario ? 3.0 : 1.9)
        .attr("stroke-dasharray", sc.dash)
        .attr("d", gen);

      const last = pts[pts.length - 1];
      svg.append("text")
        .attr("x", x(2100) + 6)
        .attr("y", y(last.pct) + 4)
        .attr("fill", sc.color)
        .attr("font-size", 10.5)
        .attr("font-weight", sc.key === state.scenario ? 700 : 500)
        .text(sc.label);
    }
  } else if (state.projTab === "composition") {
    const x = d3.scaleLinear().domain([2000, 2100]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, 75]).range([H - m.b, m.t]);

    svg.append("g")
      .attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("color", "#8a95a7");

    svg.append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#8a95a7");

    for (const g of GROUP_LABELS) {
      const pts = TIMELINE_YEARS.map(yr => {
        const v = getNationalVector(yr, state.scenario);
        return { year: yr, pct: (100 * v[g.idx]) / v[0] };
      });
      const gen = d3.line().x(d => x(d.year)).y(d => y(d.pct));
      svg.append("path")
        .datum(pts)
        .attr("fill", "none")
        .attr("stroke", g.color)
        .attr("stroke-width", 2.3)
        .attr("d", gen);

      const last = pts[pts.length - 1];
      svg.append("text")
        .attr("x", x(2100) + 6)
        .attr("y", y(last.pct) + 4)
        .attr("fill", g.color)
        .attr("font-size", 10.5)
        .attr("font-weight", 600)
        .text(`${last.pct.toFixed(1)}% ${g.name.split(" ")[0]}`);
    }
  } else {
    // Ethnic Blending & Intermarriage
    const x = d3.scaleLinear().domain([1970, 2050]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, 32]).range([H - m.b, m.t]);

    svg.append("g")
      .attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")))
      .attr("color", "#8a95a7");

    svg.append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .attr("color", "#8a95a7");

    const bLines = [
      { key: "intermarriageNew", label: "Interracial Share of New Marriages", color: "#e0a958" },
      { key: "multiracialPopPct", label: "Two or More Races (Census %)", color: "#e2645a" }
    ];

    for (const ln of bLines) {
      const gen = d3.line().x(d => x(d.year)).y(d => y(d[ln.key]));
      svg.append("path")
        .datum(BLENDING_SERIES)
        .attr("fill", "none")
        .attr("stroke", ln.color)
        .attr("stroke-width", 2.6)
        .attr("d", gen);

      const last = BLENDING_SERIES[BLENDING_SERIES.length - 1];
      svg.append("text")
        .attr("x", x(last.year) + 6)
        .attr("y", y(last[ln.key]) + 4)
        .attr("fill", ln.color)
        .attr("font-size", 10.5)
        .attr("font-weight", 600)
        .text(`${last[ln.key]}% ${ln.label}`);
    }
  }
}

function renderCenturyTable() {
  const rows = [2000, 2020, 2024, 2050, 2075, 2100];
  const tbody = document.getElementById("century-table-body");
  tbody.innerHTML = rows.map(yr => {
    const vMain = getNationalVector(yr, "main");
    const vHigh = getNationalVector(yr, "high");
    const vZero = getNationalVector(yr, "zero");
    const t = vMain[0];
    const p = idx => ((100 * vMain[idx]) / t).toFixed(1) + "%";
    const nhwHigh = ((100 * vHigh[1]) / vHigh[0]).toFixed(1) + "%";
    const nhwZero = ((100 * vZero[1]) / vZero[0]).toFixed(1) + "%";
    return `
      <tr data-year="${yr}">
        <td><strong>${yr}</strong> ${yr === 2020 ? '<span class="badge badge-maj">57.8% Decennial</span>' : yr >= 2050 ? '<span class="badge badge-mm">&lt;50% NHW</span>' : ""}</td>
        <td style="font-family:var(--font-mono)">${(t / 1e6).toFixed(1)}M</td>
        <td style="font-family:var(--font-mono);color:${(100*vMain[1])/t < 50 ? '#ff8b82' : '#8bc2f2'}"><strong>${p(1)}</strong></td>
        <td style="font-family:var(--font-mono)">${p(2)}</td>
        <td style="font-family:var(--font-mono)">${p(3)}</td>
        <td style="font-family:var(--font-mono)">${p(4)}</td>
        <td style="font-family:var(--font-mono)">${p(5)}</td>
        <td style="font-family:var(--font-mono)">${nhwHigh} / ${nhwZero}</td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      const yr = +tr.dataset.year;
      const idx = TIMELINE_YEARS.indexOf(yr);
      if (idx >= 0) {
        state.yearIndex = idx;
        document.getElementById("year-slider").value = idx;
        updateAll();
      }
    });
  });
}

// ============================================================================
// Panel C: Majority-Minority Cultural Epicenters Table
// ============================================================================
function renderEpicentersTable() {
  const tbody = document.getElementById("epicenters-tbody");
  tbody.innerHTML = CULTURAL_EPICENTERS.map(ep => {
    const v00 = getAggregateVector(ep.fipsList, 2000, "main");
    const v24 = getAggregateVector(ep.fipsList, 2024, "main");
    const v50 = getAggregateVector(ep.fipsList, 2050, "main");
    const p00 = ((100 * v00[1]) / v00[0]).toFixed(1) + "%";
    const p24 = ((100 * v24[1]) / v24[0]).toFixed(1) + "%";
    const p50 = ((100 * v50[1]) / v50[0]).toFixed(1) + "%";
    const kids24 = ep.id === "NYC"
      ? (((100 * v24[1]) / v24[0]) * 0.80).toFixed(1) + "%"
      : getCountyKidsNhwPct(ep.primaryFips, 2024).toFixed(1) + "%";
    const grp = getLargestGroup(v24);

    return `
      <tr data-id="${ep.id}">
        <td><strong>${ep.name}</strong></td>
        <td style="font-family:var(--font-mono)">${p00}</td>
        <td style="font-family:var(--font-mono);color:var(--accent)">${ep.census2020Note}</td>
        <td style="font-family:var(--font-mono)"><strong>${p24}</strong></td>
        <td style="font-family:var(--font-mono);color:#ff8b82">${p50}</td>
        <td style="font-family:var(--font-mono)">${kids24}</td>
        <td><span class="badge" style="background:${grp.color}22;color:${grp.color};border:1px solid ${grp.color}66">${grp.name}</span></td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("tr").forEach(tr => {
    tr.addEventListener("click", () => {
      state.selectedFips = tr.dataset.id;
      updateAll();
    });
  });
}

// ============================================================================
// Panel D: PACT Continuity Ratio Simulator & Post-Peak Global Context
// ============================================================================
function initPactSimulator() {
  const sliders = ["p", "a", "c", "t"];
  sliders.forEach(k => {
    document.getElementById(`sl-${k}`).addEventListener("input", updatePact);
  });
  updatePact();
}

function updatePact() {
  const P = +document.getElementById("sl-p").value;
  const A = +document.getElementById("sl-a").value;
  const C = +document.getElementById("sl-c").value;
  const T = +document.getElementById("sl-t").value;

  document.getElementById("val-p").textContent = P.toFixed(2);
  document.getElementById("val-a").textContent = A.toFixed(2);
  document.getElementById("val-c").textContent = C.toFixed(2);
  document.getElementById("val-t").textContent = T.toFixed(2);

  // Normalized Continuity Ratio where baseline (P=0.68, A=0.72, C=0.64, T=0.54) -> ~0.92
  const cr = ((A * C * T) / Math.max(0.15, P)) * 2.55;
  const crEl = document.getElementById("pact-cr-value");
  const titleEl = document.getElementById("pact-regime-title");
  const descEl = document.getElementById("pact-regime-desc");

  crEl.textContent = cr.toFixed(2);

  if (cr >= 1.15) {
    crEl.style.color = "#6cc070";
    titleEl.textContent = "Regime I: High-Cohesion Civic Convergence & Adaptation";
    descEl.textContent = "Absorptive institutions, intermarriage, and shared civic norms outpace demographic turnover. Diversity is internalized into a resilient post-ancestry Western civic identity.";
  } else if (cr >= 0.80) {
    crEl.style.color = "#e0a958";
    titleEl.textContent = "Regime II: Managed Transformation Under Strain (2050 Baseline)";
    descEl.textContent = "Western constitutional and economic institutions remain intact and recognizable, but face sustained political polarization, fiscal aging pressures, and localized enclave friction.";
  } else if (cr >= 0.55) {
    crEl.style.color = "#f46d43";
    titleEl.textContent = "Regime III: Segmented Pluralism & Civic Fragmentation";
    descEl.textContent = "Pace of demographic shift exceeds institutional absorption and generalized trust, producing parallel cultural epicenters, identity-based politics, and weakened fiscal solidarity.";
  } else {
    crEl.style.color = "#e2645a";
    titleEl.textContent = "Regime IV: Institutional Exhaustion & Systemic Fracture";
    descEl.textContent = "Severe deficit in civic core and social trust relative to pace of change triggers institutional gridlock, spatial balkanization, and erosion of foundational governance norms.";
  }
}

function renderPostPeakChart() {
  const svg = d3.select("#postpeak-chart-svg");
  svg.selectAll("*").remove();
  const W = 680, H = 230, m = { t: 20, r: 145, b: 30, l: 44 };

  const x = d3.scaleLinear().domain([1820, 2100]).range([m.l, W - m.r]);
  const y = d3.scaleLinear().domain([0, 65]).range([H - m.b, m.t]);

  svg.append("g")
    .attr("transform", `translate(0,${H - m.b})`)
    .call(d3.axisBottom(x).tickValues([1820, 1870, 1913, 1950, 2000, 2024, 2050, 2100]).tickFormat(d3.format("d")))
    .attr("color", "#8a95a7");

  svg.append("g")
    .attr("transform", `translate(${m.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
    .attr("color", "#8a95a7");

  // 1950 Peak vertical annotation
  svg.append("line")
    .attr("x1", x(1950)).attr("x2", x(1950))
    .attr("y1", m.t).attr("y2", H - m.b)
    .attr("stroke", "#e0a958")
    .attr("stroke-dasharray", "3,3");

  svg.append("text")
    .attr("x", x(1950) + 6)
    .attr("y", m.t + 10)
    .attr("fill", "#e0a958")
    .attr("font-size", 10)
    .text("1950 Relative Peak (57% GDP, 28.8% Pop)");

  const gdpLine = d3.line().x(d => x(d.year)).y(d => y(d.westGDP));
  const popLine = d3.line().x(d => x(d.year)).y(d => y(d.westPop));

  svg.append("path")
    .datum(POSTPEAK_SERIES)
    .attr("fill", "none")
    .attr("stroke", "#e0a958")
    .attr("stroke-width", 2.6)
    .attr("d", gdpLine);

  svg.append("path")
    .datum(POSTPEAK_SERIES)
    .attr("fill", "none")
    .attr("stroke", "#5b9bd5")
    .attr("stroke-width", 2.4)
    .attr("d", popLine);

  const last = POSTPEAK_SERIES[POSTPEAK_SERIES.length - 1];
  svg.append("text")
    .attr("x", x(2100) + 6)
    .attr("y", y(last.westGDP) + 4)
    .attr("fill", "#e0a958")
    .attr("font-size", 10.5)
    .attr("font-weight", 600)
    .text("Western World GDP Share");

  svg.append("text")
    .attr("x", x(2100) + 6)
    .attr("y", y(last.westPop) + 4)
    .attr("fill", "#5b9bd5")
    .attr("font-size", 10.5)
    .attr("font-weight", 600)
    .text("Western World Pop. (10.5%)");
}
