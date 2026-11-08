/**
 * 21st Century Observatory: Global Economic Convergence, Diffusion of Innovations
 * & Green Transition vs. Polycrisis (Human Exposure)
 *
 * Empirical Data & Analytical Models (2000–2025 Historical & 2026–2050 Scenarios)
 * Sources synthesized: World Bank WDI, IMF WEO (PPP), Our World in Data, IEA,
 * IRENA, BNEF, ITU, UNHCR, UCDP/PRIO, EM-DAT, IPCC AR6, Stockholm Resilience Centre.
 */

window.DASHBOARD_DATA = {
  meta: {
    title: "The 21st Century Tug-of-War",
    subtitle: "Global Economic Convergence, Diffusion of Innovations & Green Transition vs. Polycrisis Human Exposure",
    lastUpdated: "2026 Edition (2000–2025 Empirical Series + 2050 Projections)",
    years: [
      2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
      2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
      2020, 2021, 2022, 2023, 2024, 2025
    ]
  },

  // ============================================================================
  // 1. GLOBAL TIME SERIES (2000 - 2025) - 26 annual observations
  // ============================================================================
  timeSeries: {
    convergenceTransitionIndex: [
      100.0, 103.2, 106.8, 111.4, 116.9, 122.8, 129.4, 136.5, 142.1, 146.8,
      154.2, 161.9, 169.5, 177.8, 186.4, 195.8, 205.6, 216.4, 227.9, 239.5,
      246.2, 261.8, 276.4, 292.5, 309.8, 328.4
    ],
    polycrisisExposureIndex: [
      100.0, 101.4, 103.1, 105.2, 106.8, 109.5, 111.2, 113.8, 118.4, 121.0,
      125.6, 129.8, 133.4, 138.9, 146.2, 154.8, 162.1, 169.5, 176.4, 183.2,
      204.5, 211.8, 226.4, 238.9, 249.6, 258.2
    ],
    emdeGdpPppShare: [
      43.2, 43.8, 44.6, 45.7, 46.9, 48.2, 49.6, 51.0, 52.3, 53.8,
      54.9, 55.8, 56.5, 57.1, 57.6, 57.9, 58.3, 58.7, 59.1, 59.4,
      59.7, 59.9, 60.2, 60.5, 60.8, 61.1
    ],
    extremePovertyRate: [
      29.2, 28.1, 26.8, 25.4, 23.7, 21.9, 20.4, 18.9, 17.8, 16.9,
      15.7, 14.2, 13.1, 11.9, 11.1, 10.4, 9.9, 9.4, 9.0, 8.7,
      9.6, 9.1, 8.9, 8.7, 8.5, 8.3
    ],
    globalMiddleClassBillions: [
      1.52, 1.58, 1.65, 1.74, 1.85, 1.97, 2.11, 2.26, 2.38, 2.47,
      2.62, 2.78, 2.94, 3.10, 3.26, 3.41, 3.56, 3.71, 3.86, 4.01,
      3.92, 4.05, 4.16, 4.27, 4.38, 4.50
    ],
    betweenCountryGini: [
      0.574, 0.571, 0.566, 0.559, 0.552, 0.543, 0.534, 0.523, 0.512, 0.501,
      0.491, 0.482, 0.474, 0.466, 0.459, 0.453, 0.448, 0.443, 0.438, 0.434,
      0.436, 0.431, 0.427, 0.423, 0.419, 0.415
    ],
    withinCountryTop10Share: [
      46.2, 46.5, 46.8, 47.2, 47.6, 48.0, 48.4, 48.9, 48.7, 48.5,
      48.8, 49.1, 49.4, 49.6, 49.9, 50.1, 50.3, 50.5, 50.7, 50.8,
      51.4, 51.6, 51.8, 51.9, 52.1, 52.2
    ],
    emdeToOecdIncomeRatio: [
      14.8, 15.2, 15.7, 16.4, 17.2, 18.1, 19.2, 20.4, 21.5, 22.8,
      23.9, 24.9, 25.8, 26.6, 27.3, 27.9, 28.5, 29.1, 29.7, 30.3,
      30.8, 31.2, 31.7, 32.3, 32.9, 33.6
    ],
    internetPenetration: [
      6.7, 8.1, 10.6, 12.3, 14.1, 15.8, 17.6, 20.6, 23.1, 25.8,
      28.9, 31.8, 34.9, 37.9, 40.7, 43.8, 46.9, 49.7, 53.2, 56.7,
      60.8, 63.7, 65.7, 67.4, 69.2, 71.0
    ],
    smartphoneAdoption: [
      0.0, 0.0, 0.1, 0.2, 0.5, 1.2, 2.4, 4.5, 7.8, 12.4,
      18.6, 26.4, 34.8, 43.2, 51.5, 58.9, 65.2, 70.4, 74.8, 78.5,
      81.2, 83.6, 85.4, 87.1, 88.6, 90.1
    ],
    solarPvCostPerWatt: [
      4.88, 4.52, 4.10, 3.78, 3.62, 3.85, 4.02, 3.74, 3.45, 2.48,
      2.05, 1.48, 0.98, 0.82, 0.72, 0.61, 0.49, 0.39, 0.31, 0.26,
      0.23, 0.24, 0.23, 0.16, 0.12, 0.105
    ],
    batteryPackCostPerKwh: [
      1850, 1710, 1580, 1460, 1350, 1260, 1180, 1110, 1040, 980,
      915, 760, 640, 545, 480, 355, 278, 214, 176, 154,
      138, 131, 142, 128, 111, 99
    ],
    solarWindCapacityGw: [
      19, 25, 33, 41, 50, 62, 78, 98, 129, 172,
      228, 305, 389, 476, 578, 708, 849, 1012, 1189, 1388,
      1668, 1962, 2304, 2815, 3420, 4110
    ],
    evShareNewSales: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01, 0.02, 0.03, 0.04,
      0.06, 0.11, 0.21, 0.34, 0.51, 0.82, 1.12, 1.68, 2.54, 2.82,
      4.41, 8.75, 14.1, 18.0, 20.8, 23.6
    ],
    cleanToFossilInvestmentRatio: [
      0.18, 0.19, 0.21, 0.23, 0.26, 0.31, 0.37, 0.44, 0.51, 0.58,
      0.66, 0.72, 0.76, 0.81, 0.88, 1.02, 1.14, 1.21, 1.29, 1.38,
      1.52, 1.64, 1.76, 1.89, 2.02, 2.15
    ],
    tempAnomalyCelsius: [
      0.62, 0.76, 0.83, 0.84, 0.76, 0.89, 0.85, 0.86, 0.74, 0.86,
      0.93, 0.81, 0.85, 0.89, 0.96, 1.12, 1.26, 1.17, 1.09, 1.21,
      1.27, 1.11, 1.16, 1.48, 1.55, 1.52
    ],
    heatExposedPopulationBillions: [
      1.18, 1.22, 1.28, 1.31, 1.29, 1.36, 1.38, 1.42, 1.39, 1.46,
      1.54, 1.51, 1.56, 1.61, 1.68, 1.82, 1.94, 1.89, 1.86, 1.98,
      2.06, 1.99, 2.08, 2.34, 2.48, 2.52
    ],
    forciblyDisplacedMillions: [
      38.0, 38.2, 37.8, 35.9, 36.7, 37.5, 39.8, 42.7, 42.0, 43.3,
      43.7, 42.5, 45.2, 51.2, 59.5, 65.3, 65.6, 68.5, 70.8, 79.5,
      82.4, 89.3, 108.4, 117.3, 122.6, 125.4
    ],
    activeStateConflicts: [
      37, 36, 33, 31, 32, 33, 34, 35, 37, 36,
      31, 37, 33, 35, 41, 52, 51, 50, 52, 55,
      56, 54, 56, 59, 61, 60
    ],
    acuteFoodInsecurityMillions: [
      94, 96, 98, 95, 97, 99, 101, 106, 118, 115,
      108, 112, 109, 106, 104, 105, 108, 124, 113, 135,
      155, 193, 258, 282, 295, 298
    ],
    licDebtServiceShareRevenue: [
      12.4, 11.8, 11.2, 10.5, 9.6, 8.4, 6.8, 6.1, 5.9, 6.2,
      5.8, 6.0, 6.4, 7.1, 7.9, 9.2, 10.4, 11.2, 12.1, 12.9,
      14.3, 14.8, 15.6, 16.8, 17.4, 17.9
    ],
    tradeRestrictionsCount: [
      180, 195, 210, 225, 240, 260, 280, 310, 420, 680,
      640, 690, 740, 810, 890, 960, 1040, 1180, 1490, 1680,
      2450, 2610, 2980, 3240, 3480, 3620
    ]
  },

  // ============================================================================
  // 2. GLOBAL INCOME DISTRIBUTION SHIFT (2000 vs 2012 vs 2025)
  // ============================================================================
  incomeDistribution: {
    bins: [
      "$1/day", "$1.5", "$2.15\n(Pov Line)", "$3.5", "$6", "$10",
      "$15\n(Middle)", "$25", "$40", "$65\n(High)", "$100", "$160+"
    ],
    share2000: [8.4, 11.2, 13.8, 14.5, 11.8, 8.2, 6.4, 6.8, 7.5, 6.2, 3.6, 1.6],
    share2012: [3.2, 6.4, 9.8, 14.2, 16.4, 13.5, 9.8, 7.9, 7.6, 6.1, 3.4, 1.7],
    share2025: [1.4, 3.1, 5.6, 10.4, 16.8, 18.4, 14.6, 10.2, 8.1, 6.0, 3.5, 1.9]
  },

  // ============================================================================
  // 3. DIFFUSION OF INNOVATIONS (ROGERS S-CURVES & LEAPFROGGING)
  // ============================================================================
  innovationDiffusion: {
    compressionHistory: [
      { tech: "Steam Engine / Railways", era: "1840s", globalYearsTo50: 85, emdeLagYears: 62, category: "Industrial" },
      { tech: "Electricity Grid", era: "1890s", globalYearsTo50: 64, emdeLagYears: 48, category: "Energy" },
      { tech: "Automobiles", era: "1910s", globalYearsTo50: 58, emdeLagYears: 44, category: "Transport" },
      { tech: "Fixed Landline Phone", era: "1920s", globalYearsTo50: 52, emdeLagYears: 39, category: "Comms" },
      { tech: "Personal Computers", era: "1980s", globalYearsTo50: 28, emdeLagYears: 18, category: "Digital" },
      { tech: "Internet Access", era: "1995", globalYearsTo50: 21, emdeLagYears: 11, category: "Digital" },
      { tech: "Mobile Cellular", era: "1998", globalYearsTo50: 14, emdeLagYears: 6, category: "Comms" },
      { tech: "Smartphones", era: "2008", globalYearsTo50: 9, emdeLagYears: 4, category: "Digital" },
      { tech: "Instant Digital Payments (UPI/PIX/M-Pesa)", era: "2014", globalYearsTo50: 7, emdeLagYears: -2, category: "Leapfrog (EMDE Lead)" },
      { tech: "Solar PV + Distributed Storage", era: "2018", globalYearsTo50: 11, emdeLagYears: 1, category: "Green Transition" },
      { tech: "Electric Vehicles (2W/3W & Cars)", era: "2020", globalYearsTo50: 9, emdeLagYears: 0, category: "Green Transition" },
      { tech: "Generative AI Tools", era: "2023", globalYearsTo50: 4, emdeLagYears: 1, category: "Digital" }
    ],
    sCurves: {
      years: [2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2025],
      series: {
        mobileGlobal: {
          label: "Mobile Cellular Subscriptions (% Pop)",
          color: "#38bdf8",
          data: [12.1, 18.4, 27.6, 41.8, 59.7, 76.6, 88.5, 96.8, 99.7, 104.2, 106.5, 108.1, 110.4, 111.5]
        },
        internetEmde: {
          label: "Internet Penetration in Global South (%)",
          color: "#818cf8",
          data: [2.1, 3.8, 6.4, 9.8, 14.7, 21.2, 28.9, 36.4, 43.8, 51.2, 58.6, 63.4, 67.1, 69.0]
        },
        digitalPaymentsEmde: {
          label: "Digital / Mobile Account Ownership in EMDEs (% Adults)",
          color: "#a78bfa",
          data: [18.0, 20.5, 23.4, 27.1, 32.0, 38.4, 46.2, 55.4, 63.1, 68.9, 73.5, 77.8, 81.4, 83.2]
        },
        solarWindShareElec: {
          label: "Solar + Wind Share of Global Electricity Generation (%)",
          color: "#10b981",
          data: [0.2, 0.3, 0.5, 0.8, 1.3, 2.0, 3.1, 4.4, 5.8, 7.6, 9.8, 12.4, 15.6, 17.5]
        },
        evShareGlobal: {
          label: "EV Share of Global New Car Sales (%)",
          color: "#34d399",
          data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.2, 0.5, 1.1, 2.5, 4.4, 14.1, 20.8, 23.6]
        },
        cleanCookingAccess: {
          label: "Access to Clean Cooking Fuels Globally (%)",
          color: "#fbbf24",
          data: [49.2, 50.8, 52.5, 54.3, 56.2, 58.4, 60.8, 63.4, 66.1, 68.9, 71.4, 73.6, 75.5, 76.4]
        }
      }
    }
  },

  // ============================================================================
  // 4. POLYCRISIS & PLANETARY BOUNDARIES DATA
  // ============================================================================
  polycrisis: {
    planetaryBoundaries: [
      { name: "Climate Change (CO₂ & Radiative Forcing)", status2000: 135, status2025: 198, safeThreshold: 100, unit: "425 ppm vs 350 ppm safe" },
      { name: "Biosphere Integrity (Genetic & Functional)", status2000: 180, status2025: 245, safeThreshold: 100, unit: ">100 E/MSY vs <10 safe" },
      { name: "Biogeochemical Flows (Nitrogen & Phosphorus)", status2000: 170, status2025: 230, safeThreshold: 100, unit: "190 Tg N/yr vs 62 safe" },
      { name: "Freshwater Change (Blue & Green Water)", status2000: 98, status2025: 152, safeThreshold: 100, unit: "18.2% transgression" },
      { name: "Land-System Change (Forest Cover)", status2000: 112, status2025: 142, safeThreshold: 100, unit: "60% remaining vs 75% safe" },
      { name: "Novel Entities (Plastics, PFAS, Synthetics)", status2000: 110, status2025: 215, safeThreshold: 100, unit: "High transgression" },
      { name: "Ocean Acidification (Aragonite Saturation)", status2000: 82, status2025: 97, safeThreshold: 100, unit: "Near boundary (2.80 Ω)" },
      { name: "Atmospheric Aerosol Loading", status2000: 78, status2025: 86, safeThreshold: 100, unit: "Regional transgression (South Asia)" },
      { name: "Stratospheric Ozone Depletion", status2000: 94, status2025: 68, safeThreshold: 100, unit: "Recovering (Montreal Protocol)" }
    ],
    regionalExposure: [
      { region: "South Asia", popBillions: 2.04, lethalHeatPopM: 940, waterStressPopM: 1120, foodInsecurePopM: 72, displacedPopM: 11.4, greenLeapfrogScore: 71, convergenceVelocity: 78 },
      { region: "Sub-Saharan Africa", popBillions: 1.29, lethalHeatPopM: 460, waterStressPopM: 490, foodInsecurePopM: 148, displacedPopM: 45.2, greenLeapfrogScore: 48, convergenceVelocity: 52 },
      { region: "East & SE Asia", popBillions: 2.36, lethalHeatPopM: 610, waterStressPopM: 780, foodInsecurePopM: 18, displacedPopM: 6.8, greenLeapfrogScore: 89, convergenceVelocity: 88 },
      { region: "Middle East & North Africa", popBillions: 0.58, lethalHeatPopM: 285, waterStressPopM: 465, foodInsecurePopM: 41, displacedPopM: 28.6, greenLeapfrogScore: 59, convergenceVelocity: 56 },
      { region: "Latin America & Caribbean", popBillions: 0.67, lethalHeatPopM: 135, waterStressPopM: 190, foodInsecurePopM: 16, displacedPopM: 21.4, greenLeapfrogScore: 74, convergenceVelocity: 63 },
      { region: "OECD / High-Income West & Asia", popBillions: 1.18, lethalHeatPopM: 90, waterStressPopM: 210, foodInsecurePopM: 3, displacedPopM: 12.0, greenLeapfrogScore: 84, convergenceVelocity: 66 }
    ],
    cascadeNodes: [
      { id: "climate", label: "Warming (+1.52°C)\n& Extreme Weather", x: 140, y: 80, type: "crisis", severity: 92 },
      { id: "water_food", label: "Crop Yield Shocks\n& Water Stress", x: 380, y: 65, type: "crisis", severity: 86 },
      { id: "conflict", label: "State Conflict (60)\n& Geopolitical Blocs", x: 140, y: 230, type: "crisis", severity: 88 },
      { id: "displacement", label: "Forced Displacement\n(125.4M People)", x: 380, y: 230, type: "crisis", severity: 90 },
      { id: "debt", label: "Sovereign Debt Distress\n& Fiscal Squeeze", x: 620, y: 150, type: "crisis", severity: 81 },
      { id: "solar_ev", label: "Wright's Law Clean Tech\n(Solar $0.10/W, Batteries)", x: 140, y: 380, type: "solution", severity: 94 },
      { id: "digital_doi", label: "Digital Leapfrogging\n(DPI, AI, Early Warning)", x: 380, y: 380, type: "solution", severity: 89 },
      { id: "convergence", label: "Economic Convergence\n& Adaptive Capacity", x: 620, y: 340, type: "solution", severity: 85 }
    ],
    cascadeLinks: [
      { source: "climate", target: "water_food", effect: "amplifies", weight: "Strong (+)" },
      { source: "climate", target: "displacement", effect: "amplifies", weight: "Direct (+)" },
      { source: "water_food", target: "conflict", effect: "amplifies", weight: "Trigger (+)" },
      { source: "conflict", target: "displacement", effect: "amplifies", weight: "Primary (+)" },
      { source: "conflict", target: "debt", effect: "amplifies", weight: "Fiscal Shock (+)" },
      { source: "water_food", target: "debt", effect: "amplifies", weight: "Import Bill (+)" },
      { source: "debt", target: "convergence", effect: "dampens", weight: "Crowds Out (-)" },
      { source: "solar_ev", target: "climate", effect: "mitigates", weight: "Decarbonizes (-)" },
      { source: "solar_ev", target: "convergence", effect: "accelerates", weight: "Cheap Energy (+)" },
      { source: "digital_doi", target: "convergence", effect: "accelerates", weight: "Inclusion (+)" },
      { source: "digital_doi", target: "water_food", effect: "mitigates", weight: "Precision Ag (-)" },
      { source: "convergence", target: "displacement", effect: "mitigates", weight: "Resilience (-)" }
    ]
  },

  // ============================================================================
  // 5. EXPANDED NATIONS ATLAS DATASET (60 Nations covering >92% of Humanity)
  // Includes ISO3 (code), ISO Numeric 3-digit string (isoNum) for World Map
  // TopoJSON matching, Flag Emoji, Lat/Lon, and Strategic Synthesis Note.
  // ============================================================================
  countries: [
    // --- EAST & SOUTHEAST ASIA ---
    { code: "CHN", isoNum: "156", flag: "🇨🇳", lat: 35.8, lon: 104.1, name: "China", region: "East & SE Asia", popM: 1410, convergenceScore: 91, polycrisisExposure: 54, gdpPpp2000: 3450, gdpPpp2025: 25800, cleanElecShare2025: 38.5, digitalAdoption2025: 89, heatDays2025: 34, waterStress: 68, debtVulnerability: 38, conflictRisk: 22, archetype: "Fast Converger / Green Giant", summary: "Expanded GDP/cap PPP 7.5x since 2000 while dominating global solar PV, battery, and EV manufacturing scale; faces northern water stress and demographic aging." },
    { code: "VNM", isoNum: "704", flag: "🇻🇳", lat: 14.1, lon: 108.3, name: "Vietnam", region: "East & SE Asia", popM: 100, convergenceScore: 86, polycrisisExposure: 66, gdpPpp2000: 3120, gdpPpp2025: 15400, cleanElecShare2025: 42.0, digitalAdoption2025: 81, heatDays2025: 78, waterStress: 54, debtVulnerability: 32, conflictRisk: 18, archetype: "High-Exposure Leapfrogger", summary: "Export-led convergence (4.9x income gain) and rapid rooftop solar boom race against Mekong delta salinity intrusion and tropical heat stress." },
    { code: "IDN", isoNum: "360", flag: "🇮🇩", lat: -2.5, lon: 118.0, name: "Indonesia", region: "East & SE Asia", popM: 281, convergenceScore: 77, polycrisisExposure: 68, gdpPpp2000: 5890, gdpPpp2025: 16200, cleanElecShare2025: 22.4, digitalAdoption2025: 76, heatDays2025: 92, waterStress: 58, debtVulnerability: 36, conflictRisk: 26, archetype: "High-Exposure Leapfrogger", summary: "Critical mineral hub and digital payments adopter navigating coal-to-clean grid transition alongside extreme equatorial heat and coastal subsidence." },
    { code: "PHL", isoNum: "608", flag: "🇵🇭", lat: 12.9, lon: 121.8, name: "Philippines", region: "East & SE Asia", popM: 118, convergenceScore: 73, polycrisisExposure: 79, gdpPpp2000: 4650, gdpPpp2025: 11800, cleanElecShare2025: 29.1, digitalAdoption2025: 74, heatDays2025: 96, waterStress: 61, debtVulnerability: 44, conflictRisk: 38, archetype: "Climate Frontline Converger", summary: "Strong services and digital fintech growth confront the world's highest typhoon intensity corridor and 96 annual days of dangerous heat stress." },
    { code: "THA", isoNum: "764", flag: "🇹🇭", lat: 15.9, lon: 100.9, name: "Thailand", region: "East & SE Asia", popM: 71.8, convergenceScore: 74, polycrisisExposure: 61, gdpPpp2000: 10800, gdpPpp2025: 23400, cleanElecShare2025: 24.5, digitalAdoption2025: 86, heatDays2025: 88, waterStress: 62, debtVulnerability: 41, conflictRisk: 28, archetype: "High-Exposure Leapfrogger", summary: "Near-universal PromptPay digital infrastructure and regional EV manufacturing hub mitigating Chao Phraya flood and heat vulnerability." },
    { code: "MYS", isoNum: "458", flag: "🇲🇾", lat: 4.2, lon: 101.9, name: "Malaysia", region: "East & SE Asia", popM: 34.5, convergenceScore: 80, polycrisisExposure: 52, gdpPpp2000: 16100, gdpPpp2025: 37800, cleanElecShare2025: 26.0, digitalAdoption2025: 91, heatDays2025: 82, waterStress: 42, debtVulnerability: 39, conflictRisk: 16, archetype: "Fast Converger / Green Giant", summary: "Approaching high-income OECD threshold ($37.8k PPP) with deep semiconductor integration and accelerating solar grid buildout." },
    { code: "KHM", isoNum: "116", flag: "🇰🇭", lat: 12.6, lon: 104.9, name: "Cambodia", region: "East & SE Asia", popM: 17.1, convergenceScore: 69, polycrisisExposure: 74, gdpPpp2000: 1680, gdpPpp2025: 6420, cleanElecShare2025: 54.0, digitalAdoption2025: 67, heatDays2025: 104, waterStress: 56, debtVulnerability: 52, conflictRisk: 29, archetype: "Climate Frontline Converger", summary: "Nearly quadrupled per-capita income since 2000 with high hydro/solar share, but faces severe wet-bulb heat and Tonlé Sap hydrological shifts." },
    { code: "MMR", isoNum: "104", flag: "🇲🇲", lat: 21.9, lon: 95.9, name: "Myanmar", region: "East & SE Asia", popM: 54.6, convergenceScore: 34, polycrisisExposure: 89, gdpPpp2000: 1450, gdpPpp2025: 4850, cleanElecShare2025: 48.0, digitalAdoption2025: 46, heatDays2025: 94, waterStress: 58, debtVulnerability: 68, conflictRisk: 94, archetype: "Polycrisis Trap Risk", summary: "Post-2021 civil conflict reversed a decade of rapid economic convergence and telecom leapfrogging, driving mass internal displacement." },

    // --- SOUTH ASIA ---
    { code: "IND", isoNum: "356", flag: "🇮🇳", lat: 20.6, lon: 78.9, name: "India", region: "South Asia", popM: 1442, convergenceScore: 84, polycrisisExposure: 77, gdpPpp2000: 2540, gdpPpp2025: 11150, cleanElecShare2025: 26.8, digitalAdoption2025: 82, heatDays2025: 108, waterStress: 86, debtVulnerability: 46, conflictRisk: 42, archetype: "High-Exposure Leapfrogger", summary: "World-leading Digital Public Infrastructure (Aadhaar/UPI), 4.4x GDP/cap catch-up, and >200 GW clean power race against acute groundwater depletion and 108 lethal heat days/yr." },
    { code: "BGD", isoNum: "050", flag: "🇧🇩", lat: 23.7, lon: 90.4, name: "Bangladesh", region: "South Asia", popM: 174, convergenceScore: 75, polycrisisExposure: 85, gdpPpp2000: 2180, gdpPpp2025: 9420, cleanElecShare2025: 9.4, digitalAdoption2025: 68, heatDays2025: 116, waterStress: 74, debtVulnerability: 58, conflictRisk: 48, archetype: "Climate Frontline Converger", summary: "Remarkable poverty reduction, off-grid solar home systems, and cyclone early-warning success confront extreme deltaic flooding and wet-bulb heat." },
    { code: "PAK", isoNum: "586", flag: "🇵🇰", lat: 30.4, lon: 69.3, name: "Pakistan", region: "South Asia", popM: 245, convergenceScore: 49, polycrisisExposure: 89, gdpPpp2000: 3420, gdpPpp2025: 6350, cleanElecShare2025: 41.2, digitalAdoption2025: 54, heatDays2025: 124, waterStress: 92, debtVulnerability: 86, conflictRisk: 74, archetype: "Polycrisis Trap Risk", summary: "Compounding sovereign debt distress, Indus basin water stress, and extreme heat/flood shocks — yet experiencing an unprecedented grassroots Chinese solar module import boom." },
    { code: "LKA", isoNum: "144", flag: "🇱🇰", lat: 7.9, lon: 80.8, name: "Sri Lanka", region: "South Asia", popM: 22.0, convergenceScore: 62, polycrisisExposure: 71, gdpPpp2000: 5600, gdpPpp2025: 14200, cleanElecShare2025: 52.0, digitalAdoption2025: 71, heatDays2025: 86, waterStress: 64, debtVulnerability: 82, conflictRisk: 36, archetype: "Climate Frontline Converger", summary: "High human development and renewable electricity share recovering from sovereign default and imported fuel/food price shocks." },
    { code: "NPL", isoNum: "524", flag: "🇳🇵", lat: 28.4, lon: 84.1, name: "Nepal", region: "South Asia", popM: 31.1, convergenceScore: 66, polycrisisExposure: 69, gdpPpp2000: 1850, gdpPpp2025: 5380, cleanElecShare2025: 98.5, digitalAdoption2025: 66, heatDays2025: 48, waterStress: 62, debtVulnerability: 48, conflictRisk: 32, archetype: "Climate Frontline Converger", summary: "Near-100% clean hydropower grid and rapid EV adoption in Kathmandu valley counterbalancing Himalayan glacial melt risks." },

    // --- SUB-SAHARAN AFRICA ---
    { code: "KEN", isoNum: "404", flag: "🇰🇪", lat: -0.02, lon: 37.9, name: "Kenya", region: "Sub-Saharan Africa", popM: 56.2, convergenceScore: 72, polycrisisExposure: 70, gdpPpp2000: 2980, gdpPpp2025: 6580, cleanElecShare2025: 89.5, digitalAdoption2025: 79, heatDays2025: 54, waterStress: 68, debtVulnerability: 74, conflictRisk: 44, archetype: "High-Exposure Leapfrogger", summary: "Pioneer of M-Pesa mobile money and ~90% geothermal/wind/solar electricity grid, though constrained by high external debt service costs." },
    { code: "RWA", isoNum: "646", flag: "🇷🇼", lat: -1.9, lon: 29.9, name: "Rwanda", region: "Sub-Saharan Africa", popM: 14.4, convergenceScore: 74, polycrisisExposure: 64, gdpPpp2000: 980, gdpPpp2025: 3480, cleanElecShare2025: 61.0, digitalAdoption2025: 69, heatDays2025: 32, waterStress: 58, debtVulnerability: 62, conflictRisk: 46, archetype: "High-Exposure Leapfrogger", summary: "3.5x GDP/cap PPP growth since 2000 alongside rapid public service digitization, drone medical logistics, and universal health coverage." },
    { code: "ETH", isoNum: "231", flag: "🇪🇹", lat: 9.1, lon: 40.5, name: "Ethiopia", region: "Sub-Saharan Africa", popM: 129, convergenceScore: 58, polycrisisExposure: 84, gdpPpp2000: 820, gdpPpp2025: 3120, cleanElecShare2025: 96.0, digitalAdoption2025: 44, heatDays2025: 68, waterStress: 76, debtVulnerability: 81, conflictRisk: 79, archetype: "Polycrisis Trap Risk", summary: "Massive hydropower expansion (GERD) and bold ICE car import ban to leapfrog to EVs, weighed down by internal armed conflicts, drought, and debt restructuring." },
    { code: "NGA", isoNum: "566", flag: "🇳🇬", lat: 9.1, lon: 8.7, name: "Nigeria", region: "Sub-Saharan Africa", popM: 229, convergenceScore: 51, polycrisisExposure: 83, gdpPpp2000: 3450, gdpPpp2025: 6180, cleanElecShare2025: 24.0, digitalAdoption2025: 64, heatDays2025: 98, waterStress: 69, debtVulnerability: 76, conflictRisk: 78, archetype: "Polycrisis Trap Risk", summary: "Booming fintech ecosystem and distributed solar mini-grids bypass a failing national grid amid severe inflation, fiscal strain, and northern insecurity." },
    { code: "ZAF", isoNum: "710", flag: "🇿🇦", lat: -30.6, lon: 22.9, name: "South Africa", region: "Sub-Saharan Africa", popM: 61.0, convergenceScore: 59, polycrisisExposure: 62, gdpPpp2000: 11200, gdpPpp2025: 15900, cleanElecShare2025: 21.5, digitalAdoption2025: 78, heatDays2025: 36, waterStress: 78, debtVulnerability: 66, conflictRisk: 41, archetype: "Resource Transitioner", summary: "Private-sector rooftop solar and wind additions surged in response to coal utility load-shedding, though high domestic inequality and water stress persist." },
    { code: "GHA", isoNum: "288", flag: "🇬🇭", lat: 7.9, lon: -1.0, name: "Ghana", region: "Sub-Saharan Africa", popM: 34.6, convergenceScore: 63, polycrisisExposure: 72, gdpPpp2000: 2890, gdpPpp2025: 7450, cleanElecShare2025: 38.0, digitalAdoption2025: 74, heatDays2025: 94, waterStress: 56, debtVulnerability: 84, conflictRisk: 34, archetype: "Climate Frontline Converger", summary: "High mobile money inclusion and democratic stability navigating post-default sovereign debt restructuring and rising Gulf of Guinea heat." },
    { code: "SEN", isoNum: "686", flag: "🇸🇳", lat: 14.5, lon: -14.5, name: "Senegal", region: "Sub-Saharan Africa", popM: 18.2, convergenceScore: 64, polycrisisExposure: 73, gdpPpp2000: 2650, gdpPpp2025: 4820, cleanElecShare2025: 34.0, digitalAdoption2025: 68, heatDays2025: 102, waterStress: 71, debtVulnerability: 68, conflictRisk: 38, archetype: "Climate Frontline Converger", summary: "West African clean energy and digital hub scaling utility solar + storage while confronting Sahelian heatwaves and coastal erosion." },
    { code: "TZA", isoNum: "834", flag: "🇹🇿", lat: -6.4, lon: 34.9, name: "Tanzania", region: "Sub-Saharan Africa", popM: 68.6, convergenceScore: 62, polycrisisExposure: 69, gdpPpp2000: 1720, gdpPpp2025: 4120, cleanElecShare2025: 46.0, digitalAdoption2025: 59, heatDays2025: 64, waterStress: 61, debtVulnerability: 54, conflictRisk: 31, archetype: "Climate Frontline Converger", summary: "Steady 2.4x real income convergence, expanding rural electrification, and mobile banking offsetting East African rainfall volatility." },
    { code: "AGO", isoNum: "024", flag: "🇦🇴", lat: -11.2, lon: 17.9, name: "Angola", region: "Sub-Saharan Africa", popM: 37.8, convergenceScore: 47, polycrisisExposure: 78, gdpPpp2000: 4620, gdpPpp2025: 7890, cleanElecShare2025: 72.0, digitalAdoption2025: 48, heatDays2025: 72, waterStress: 64, debtVulnerability: 79, conflictRisk: 49, archetype: "Polycrisis Trap Risk", summary: "High hydropower share and Lobito critical-mineral rail corridor potential hampered by oil dependency and external debt service." },
    { code: "COD", isoNum: "180", flag: "🇨🇩", lat: -4.0, lon: 21.8, name: "DR Congo", region: "Sub-Saharan Africa", popM: 105, convergenceScore: 36, polycrisisExposure: 91, gdpPpp2000: 890, gdpPpp2025: 1580, cleanElecShare2025: 98.0, digitalAdoption2025: 32, heatDays2025: 84, waterStress: 52, debtVulnerability: 74, conflictRisk: 92, archetype: "Polycrisis Trap Risk", summary: "Supplies >70% of global cobalt and vast copper for the green transition, yet eastern armed conflict and governance fragility trap 7M+ displaced citizens." },
    { code: "SDN", isoNum: "729", flag: "🇸🇩", lat: 12.9, lon: 30.2, name: "Sudan", region: "Sub-Saharan Africa", popM: 49.4, convergenceScore: 24, polycrisisExposure: 96, gdpPpp2000: 2750, gdpPpp2025: 2450, cleanElecShare2025: 58.0, digitalAdoption2025: 34, heatDays2025: 138, waterStress: 91, debtVulnerability: 94, conflictRisk: 98, archetype: "Polycrisis Trap Risk", summary: "Catastrophic state collapse and civil war created the world's largest internal displacement and acute famine crisis atop 138 days/yr of lethal heat." },

    // --- MIDDLE EAST & NORTH AFRICA ---
    { code: "MAR", isoNum: "504", flag: "🇲🇦", lat: 31.8, lon: -7.1, name: "Morocco", region: "MENA", popM: 38.0, convergenceScore: 73, polycrisisExposure: 65, gdpPpp2000: 4680, gdpPpp2025: 10650, cleanElecShare2025: 44.5, digitalAdoption2025: 78, heatDays2025: 62, waterStress: 89, debtVulnerability: 54, conflictRisk: 29, archetype: "High-Exposure Leapfrogger", summary: "Global leader in solar/wind, EV battery supply chain investment, and seawater desalination to counter severe multi-year structural drought." },
    { code: "EGY", isoNum: "818", flag: "🇪🇬", lat: 26.8, lon: 30.8, name: "Egypt", region: "MENA", popM: 114, convergenceScore: 61, polycrisisExposure: 78, gdpPpp2000: 7850, gdpPpp2025: 17400, cleanElecShare2025: 18.2, digitalAdoption2025: 68, heatDays2025: 86, waterStress: 96, debtVulnerability: 85, conflictRisk: 54, archetype: "Polycrisis Trap Risk", summary: "World's largest wheat importer facing acute Nile water scarcity, regional conflict spillovers, and heavy sovereign debt service." },
    { code: "DZA", isoNum: "012", flag: "🇩🇿", lat: 28.0, lon: 1.7, name: "Algeria", region: "MENA", popM: 46.2, convergenceScore: 60, polycrisisExposure: 66, gdpPpp2000: 10200, gdpPpp2025: 16800, cleanElecShare2025: 4.2, digitalAdoption2025: 71, heatDays2025: 94, waterStress: 92, debtVulnerability: 34, conflictRisk: 38, archetype: "Resource Transitioner", summary: "Low external debt and vast Saharan solar potential, but heavily reliant on hydrocarbon revenues amid rising Mediterranean aridification." },
    { code: "ARE", isoNum: "784", flag: "🇦🇪", lat: 23.4, lon: 53.8, name: "United Arab Emirates", region: "MENA", popM: 10.2, convergenceScore: 81, polycrisisExposure: 55, gdpPpp2000: 78500, gdpPpp2025: 89400, cleanElecShare2025: 28.4, digitalAdoption2025: 98, heatDays2025: 132, waterStress: 98, debtVulnerability: 18, conflictRisk: 28, archetype: "Resource Transitioner", summary: "Ultra-high capital adaptive capacity funding Barakah nuclear, record-low-cost utility solar, and AI compute hubs in an extreme wet-bulb heat environment." },
    { code: "SAU", isoNum: "682", flag: "🇸🇦", lat: 23.9, lon: 45.1, name: "Saudi Arabia", region: "MENA", popM: 37.2, convergenceScore: 74, polycrisisExposure: 58, gdpPpp2000: 46200, gdpPpp2025: 64800, cleanElecShare2025: 11.5, digitalAdoption2025: 95, heatDays2025: 128, waterStress: 97, debtVulnerability: 22, conflictRisk: 38, archetype: "Resource Transitioner", summary: "Deploying oil windfalls into utility-scale solar, green hydrogen, and solar-powered desalination against extreme desert heat." },
    { code: "IRN", isoNum: "364", flag: "🇮🇷", lat: 32.4, lon: 53.7, name: "Iran", region: "MENA", popM: 89.8, convergenceScore: 52, polycrisisExposure: 81, gdpPpp2000: 12400, gdpPpp2025: 18200, cleanElecShare2025: 7.5, digitalAdoption2025: 73, heatDays2025: 92, waterStress: 96, debtVulnerability: 58, conflictRisk: 84, archetype: "Polycrisis Trap Risk", summary: "High scientific human capital constrained by geopolitical conflict, sanctions, fossil fuel subsidies, and severe aquifer depletion." },
    { code: "TUR", isoNum: "792", flag: "🇹🇷", lat: 38.9, lon: 35.2, name: "Türkiye", region: "MENA", popM: 85.8, convergenceScore: 76, polycrisisExposure: 61, gdpPpp2000: 14800, gdpPpp2025: 39600, cleanElecShare2025: 44.2, digitalAdoption2025: 85, heatDays2025: 42, waterStress: 76, debtVulnerability: 64, conflictRisk: 49, archetype: "High-Exposure Leapfrogger", summary: "Expanded GDP/cap PPP 2.7x since 2000 with 44% clean electricity, domestic EV manufacturing (Togg), and major refugee hosting capacity." },
    { code: "YEM", isoNum: "887", flag: "🇾🇪", lat: 15.6, lon: 48.5, name: "Yemen", region: "MENA", popM: 35.2, convergenceScore: 19, polycrisisExposure: 97, gdpPpp2000: 4120, gdpPpp2025: 1850, cleanElecShare2025: 26.0, digitalAdoption2025: 28, heatDays2025: 118, waterStress: 99, debtVulnerability: 95, conflictRisk: 97, archetype: "Polycrisis Trap Risk", summary: "Acute polycrisis archetype: protracted war, groundwater exhaustion, and food import dependence reduced per-capita income by >55% since 2000." },

    // --- LATIN AMERICA & CARIBBEAN ---
    { code: "BRA", isoNum: "076", flag: "🇧🇷", lat: -14.2, lon: -51.9, name: "Brazil", region: "Latin America", popM: 217, convergenceScore: 78, polycrisisExposure: 53, gdpPpp2000: 12400, gdpPpp2025: 20800, cleanElecShare2025: 89.2, digitalAdoption2025: 88, heatDays2025: 64, waterStress: 44, debtVulnerability: 56, conflictRisk: 34, archetype: "Fast Converger / Green Giant", summary: "Powerhouse of clean energy (~89% hydro/wind/solar electricity + biofuels) and PIX instant digital payments, working to halt Amazon dieback." },
    { code: "CHL", isoNum: "152", flag: "🇨🇱", lat: -35.7, lon: -71.5, name: "Chile", region: "Latin America", popM: 19.7, convergenceScore: 82, polycrisisExposure: 48, gdpPpp2000: 14900, gdpPpp2025: 31800, cleanElecShare2025: 68.4, digitalAdoption2025: 90, heatDays2025: 22, waterStress: 79, debtVulnerability: 38, conflictRisk: 22, archetype: "Fast Converger / Green Giant", summary: "Atacama solar + battery storage leader and critical lithium/copper supplier managing central valley megadrought." },
    { code: "URY", isoNum: "858", flag: "🇺🇾", lat: -32.5, lon: -55.8, name: "Uruguay", region: "Latin America", popM: 3.4, convergenceScore: 85, polycrisisExposure: 34, gdpPpp2000: 14200, gdpPpp2025: 32400, cleanElecShare2025: 96.5, digitalAdoption2025: 89, heatDays2025: 18, waterStress: 32, debtVulnerability: 36, conflictRisk: 14, archetype: "Fast Converger / Green Giant", summary: "Model green converger: 96.5% wind/hydro/biomass electricity grid, strong democratic institutions, and high social cohesion." },
    { code: "MEX", isoNum: "484", flag: "🇲🇽", lat: 23.6, lon: -102.5, name: "Mexico", region: "Latin America", popM: 130, convergenceScore: 67, polycrisisExposure: 59, gdpPpp2000: 17800, gdpPpp2025: 24600, cleanElecShare2025: 27.5, digitalAdoption2025: 79, heatDays2025: 58, waterStress: 76, debtVulnerability: 48, conflictRisk: 52, archetype: "Resource Transitioner", summary: "Major manufacturing nearshoring beneficiary facing severe northern/central aquifer stress and slow state-utility clean power transition." },
    { code: "COL", isoNum: "170", flag: "🇨🇴", lat: 4.6, lon: -74.3, name: "Colombia", region: "Latin America", popM: 52.3, convergenceScore: 71, polycrisisExposure: 61, gdpPpp2000: 9800, gdpPpp2025: 20400, cleanElecShare2025: 74.8, digitalAdoption2025: 78, heatDays2025: 56, waterStress: 39, debtVulnerability: 54, conflictRisk: 56, archetype: "High-Exposure Leapfrogger", summary: "Doubled real per-capita income since 2000 with a clean hydro-dominated grid while integrating 2.8M Venezuelan migrants." },
    { code: "PER", isoNum: "604", flag: "🇵🇪", lat: -9.2, lon: -75.0, name: "Peru", region: "Latin America", popM: 34.4, convergenceScore: 68, polycrisisExposure: 62, gdpPpp2000: 7150, gdpPpp2025: 16900, cleanElecShare2025: 61.5, digitalAdoption2025: 74, heatDays2025: 38, waterStress: 68, debtVulnerability: 39, conflictRisk: 42, archetype: "High-Exposure Leapfrogger", summary: "Macroeconomic stability and critical copper supply counterbalanced by Andean glacial retreat and Pacific El Niño shocks." },
    { code: "ARG", isoNum: "032", flag: "🇦🇷", lat: -38.4, lon: -63.6, name: "Argentina", region: "Latin America", popM: 46.8, convergenceScore: 56, polycrisisExposure: 58, gdpPpp2000: 18900, gdpPpp2025: 26200, cleanElecShare2025: 42.1, digitalAdoption2025: 84, heatDays2025: 32, waterStress: 46, debtVulnerability: 89, conflictRisk: 28, archetype: "Resource Transitioner", summary: "High human capital, digital fintech adoption, and lithium/wind resources repeatedly held back by chronic sovereign debt and currency crises." },
    { code: "HTI", isoNum: "332", flag: "🇭🇹", lat: 18.9, lon: -72.3, name: "Haiti", region: "Latin America", popM: 11.8, convergenceScore: 22, polycrisisExposure: 93, gdpPpp2000: 3250, gdpPpp2025: 2920, cleanElecShare2025: 21.0, digitalAdoption2025: 36, heatDays2025: 92, waterStress: 74, debtVulnerability: 82, conflictRisk: 94, archetype: "Polycrisis Trap Risk", summary: "Compounding institutional collapse, armed gang violence, hurricane exposure, and acute food insecurity caused real income contraction since 2000." },

    // --- OECD / HIGH INCOME & EUROPE / EURASIA ---
    { code: "USA", isoNum: "840", flag: "🇺🇸", lat: 38.0, lon: -97.0, name: "United States", region: "OECD / High Income", popM: 336, convergenceScore: 79, polycrisisExposure: 41, gdpPpp2000: 50200, gdpPpp2025: 78900, cleanElecShare2025: 43.8, digitalAdoption2025: 94, heatDays2025: 32, waterStress: 49, debtVulnerability: 48, conflictRisk: 26, archetype: "Resilient Tech Leader", summary: "Global frontier AI, biotech, and venture hub with surging solar/battery deployment in Texas & California, facing rising wildfire/hurricane insurance losses." },
    { code: "CAN", isoNum: "124", flag: "🇨🇦", lat: 56.1, lon: -106.3, name: "Canada", region: "OECD / High Income", popM: 40.8, convergenceScore: 81, polycrisisExposure: 33, gdpPpp2000: 44100, gdpPpp2025: 62800, cleanElecShare2025: 82.5, digitalAdoption2025: 95, heatDays2025: 8, waterStress: 24, debtVulnerability: 34, conflictRisk: 14, archetype: "Resilient Tech Leader", summary: "82.5% clean hydro/nuclear/wind electricity grid and vast freshwater reserves, managing boreal wildfire smoke and oil-sands transition." },
    { code: "DEU", isoNum: "276", flag: "🇩🇪", lat: 51.2, lon: 10.4, name: "Germany", region: "OECD / High Income", popM: 84.5, convergenceScore: 81, polycrisisExposure: 31, gdpPpp2000: 44800, gdpPpp2025: 64200, cleanElecShare2025: 61.4, digitalAdoption2025: 93, heatDays2025: 12, waterStress: 38, debtVulnerability: 26, conflictRisk: 18, archetype: "Resilient Tech Leader", summary: "Reached >61% renewable electricity share after rapid post-2022 Russian gas phase-out while navigating industrial energy costs and aging demographics." },
    { code: "GBR", isoNum: "826", flag: "🇬🇧", lat: 55.4, lon: -3.4, name: "United Kingdom", region: "OECD / High Income", popM: 68.3, convergenceScore: 80, polycrisisExposure: 30, gdpPpp2000: 40200, gdpPpp2025: 57600, cleanElecShare2025: 63.8, digitalAdoption2025: 95, heatDays2025: 8, waterStress: 34, debtVulnerability: 38, conflictRisk: 18, archetype: "Resilient Tech Leader", summary: "Completely phased out coal power in 2024 and scaled offshore wind to >63% clean electricity alongside absolute GDP-emissions decoupling." },
    { code: "FRA", isoNum: "250", flag: "🇫🇷", lat: 46.2, lon: 2.2, name: "France", region: "OECD / High Income", popM: 68.4, convergenceScore: 82, polycrisisExposure: 32, gdpPpp2000: 41600, gdpPpp2025: 58400, cleanElecShare2025: 92.4, digitalAdoption2025: 93, heatDays2025: 16, waterStress: 42, debtVulnerability: 44, conflictRisk: 20, archetype: "Resilient Tech Leader", summary: "One of the lowest-carbon major economies (92.4% nuclear + hydro/wind/solar electricity), adapting to summer heatwaves and river warming." },
    { code: "ESP", isoNum: "724", flag: "🇪🇸", lat: 40.5, lon: -3.7, name: "Spain", region: "OECD / High Income", popM: 48.6, convergenceScore: 83, polycrisisExposure: 42, gdpPpp2000: 34200, gdpPpp2025: 52400, cleanElecShare2025: 71.2, digitalAdoption2025: 93, heatDays2025: 36, waterStress: 74, debtVulnerability: 42, conflictRisk: 16, archetype: "Resilient Tech Leader", summary: "European solar and wind powerhouse (>71% clean electricity) on the Mediterranean frontline of Iberian heat and hydrological stress." },
    { code: "ITA", isoNum: "380", flag: "🇮🇹", lat: 41.9, lon: 12.6, name: "Italy", region: "OECD / High Income", popM: 58.9, convergenceScore: 74, polycrisisExposure: 43, gdpPpp2000: 43200, gdpPpp2025: 56800, cleanElecShare2025: 48.5, digitalAdoption2025: 89, heatDays2025: 34, waterStress: 62, debtVulnerability: 58, conflictRisk: 18, archetype: "Resilient Tech Leader", summary: "High industrial resilience and rapid solar growth balancing Po Valley drought volatility, public debt, and demographic aging." },
    { code: "NOR", isoNum: "578", flag: "🇳🇴", lat: 60.5, lon: 8.5, name: "Norway", region: "OECD / High Income", popM: 5.5, convergenceScore: 92, polycrisisExposure: 18, gdpPpp2000: 61200, gdpPpp2025: 88600, cleanElecShare2025: 98.8, digitalAdoption2025: 99, heatDays2025: 2, waterStress: 14, debtVulnerability: 10, conflictRisk: 12, archetype: "Resilient Tech Leader", summary: "World's most advanced EV S-curve (>90% of new car sales electric), 98.8% clean hydro power, and $1.7T sovereign wealth buffer." },
    { code: "SWE", isoNum: "752", flag: "🇸🇪", lat: 60.1, lon: 18.6, name: "Sweden", region: "OECD / High Income", popM: 10.6, convergenceScore: 91, polycrisisExposure: 20, gdpPpp2000: 44600, gdpPpp2025: 68400, cleanElecShare2025: 98.5, digitalAdoption2025: 98, heatDays2025: 3, waterStress: 16, debtVulnerability: 14, conflictRisk: 14, archetype: "Resilient Tech Leader", summary: "Near-zero-carbon electricity grid (hydro/nuclear/wind) pioneering fossil-free green steel and cashless digital infrastructure." },
    { code: "POL", isoNum: "616", flag: "🇵🇱", lat: 51.9, lon: 19.1, name: "Poland", region: "OECD / High Income", popM: 37.6, convergenceScore: 85, polycrisisExposure: 35, gdpPpp2000: 16400, gdpPpp2025: 47200, cleanElecShare2025: 31.2, digitalAdoption2025: 89, heatDays2025: 11, waterStress: 44, debtVulnerability: 32, conflictRisk: 28, archetype: "Fast Converger / Green Giant", summary: "European convergence champion: nearly tripled real GDP/cap PPP since 2000 while rapidly replacing coal with residential solar and Baltic offshore wind." },
    { code: "KOR", isoNum: "410", flag: "🇰🇷", lat: 35.9, lon: 127.8, name: "South Korea", region: "OECD / High Income", popM: 51.7, convergenceScore: 88, polycrisisExposure: 36, gdpPpp2000: 24100, gdpPpp2025: 56200, cleanElecShare2025: 39.8, digitalAdoption2025: 97, heatDays2025: 18, waterStress: 59, debtVulnerability: 24, conflictRisk: 32, archetype: "Resilient Tech Leader", summary: "High-tech convergence model (memory chips, EV batteries, nuclear/clean tech) facing the world's steepest fertility decline." },
    { code: "JPN", isoNum: "392", flag: "🇯🇵", lat: 36.2, lon: 138.3, name: "Japan", region: "OECD / High Income", popM: 124, convergenceScore: 68, polycrisisExposure: 39, gdpPpp2000: 38200, gdpPpp2025: 51400, cleanElecShare2025: 34.2, digitalAdoption2025: 92, heatDays2025: 24, waterStress: 44, debtVulnerability: 58, conflictRisk: 18, archetype: "Resilient Tech Leader", summary: "World-class disaster-resilient infrastructure and robotics automation adapting to a shrinking workforce and imported energy transition." },
    { code: "AUS", isoNum: "036", flag: "🇦🇺", lat: -25.3, lon: 133.8, name: "Australia", region: "OECD / High Income", popM: 26.9, convergenceScore: 81, polycrisisExposure: 44, gdpPpp2000: 42800, gdpPpp2025: 65400, cleanElecShare2025: 41.6, digitalAdoption2025: 95, heatDays2025: 46, waterStress: 64, debtVulnerability: 24, conflictRisk: 14, archetype: "Resilient Tech Leader", summary: "World's highest per-capita rooftop solar penetration and critical lithium exporter confronting bushfire/drought extremes." },
    { code: "RUS", isoNum: "643", flag: "🇷🇺", lat: 61.5, lon: 105.3, name: "Russia", region: "OECD / High Income", popM: 144, convergenceScore: 54, polycrisisExposure: 68, gdpPpp2000: 14600, gdpPpp2025: 38200, cleanElecShare2025: 37.5, digitalAdoption2025: 84, heatDays2025: 8, waterStress: 28, debtVulnerability: 32, conflictRisk: 92, archetype: "Resource Transitioner", summary: "War economy, geopolitical isolation, and fossil-fuel export dependency offset earlier 2000s commodity convergence and accelerate permafrost thaw." },
    { code: "KAZ", isoNum: "398", flag: "🇰🇿", lat: 48.0, lon: 66.9, name: "Kazakhstan", region: "OECD / High Income", popM: 20.2, convergenceScore: 71, polycrisisExposure: 54, gdpPpp2000: 10400, gdpPpp2025: 34600, cleanElecShare2025: 14.8, digitalAdoption2025: 86, heatDays2025: 24, waterStress: 72, debtVulnerability: 29, conflictRisk: 28, archetype: "Resource Transitioner", summary: "3.3x GDP/cap PPP catch-up and advanced e-government/fintech adoption in Central Asia, working to diversify from coal and oil." },
    { code: "UKR", isoNum: "804", flag: "🇺🇦", lat: 48.4, lon: 31.2, name: "Ukraine", region: "OECD / High Income", popM: 37.8, convergenceScore: 44, polycrisisExposure: 88, gdpPpp2000: 6800, gdpPpp2025: 14100, cleanElecShare2025: 64.0, digitalAdoption2025: 84, heatDays2025: 14, waterStress: 48, debtVulnerability: 91, conflictRisk: 99, archetype: "Polycrisis Trap Risk", summary: "High digital resilience (Diia state-in-a-smartphone) and decentralized grid adaptation sustaining society under full-scale armed invasion." }
  ],

  // ============================================================================
  // 6. 2025–2050 SCENARIO PRESETS & MODEL PARAMETERS
  // ============================================================================
  scenarios: {
    presets: {
      baseline: {
        name: "The Uneven Race (Current Trajectory)",
        description: "Solar, EVs, and digital infrastructure continue rapid diffusion, lifting most middle-income economies, but +2.4°C warming, sovereign debt squeezes, and regional conflicts trap ~1.4B people in high polycrisis exposure.",
        sliders: { doiVelocity: 68, convergencePolicy: 55, climateAction: 52, geopolitics: 42 }
      },
      greenConvergence: {
        name: "Solar-Digital Convergence (Breakthrough Adaptation)",
        description: "Ultra-cheap solar+storage ($15/MWh), open digital public infrastructure, climate finance reform, and de-escalation allow Global South economies to leapfrog fossil lock-in and build deep climate resilience before 2040.",
        sliders: { doiVelocity: 92, convergencePolicy: 86, climateAction: 88, geopolitics: 80 }
      },
      fragmentedFortress: {
        name: "Fragmented Fortress World (Bloc Rivalry)",
        description: "Tariff walls, critical mineral hoarding, and geopolitical rivalry slow clean-tech transfer to developing nations. Advanced economies adapt behind walls while low-income regions face worsening heat and fiscal crises.",
        sliders: { doiVelocity: 48, convergencePolicy: 30, climateAction: 44, geopolitics: 20 }
      },
      runawayPolycrisis: {
        name: "Compounding Polycrisis (Tipping Points & Fragility)",
        description: "High warming (+2.9°C by 2050), synchronous breadbasket failures, sovereign defaults, and proliferating armed conflicts overwhelm adaptive capacity, reversing decades of global economic convergence.",
        sliders: { doiVelocity: 35, convergencePolicy: 22, climateAction: 20, geopolitics: 15 }
      }
    },
    projectionYears: [2025, 2030, 2035, 2040, 2045, 2050]
  }
};
