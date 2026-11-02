/* ============================================================
   POLYCRISIS RESILIENCE MONITOR — data layer
   Qualitative indices (0–1) derived from H Heuristics polycrisis
   research: shock exposure, adaptive capacity, institutional
   resilience, compound hazard load, resilience outlook.
   ============================================================ */
'use strict';

window.APX = window.APX || {};

/* Region baselines used by js/app.js REGION_RULES (fallback values). */
APX.REGIONS = [
  { id: 'ssa',      name: 'Sub-Saharan Africa',      shock: 0.82, adaptive: 0.24, institutional: 0.28, hazard: 0.86, outlook: -0.55, heat: 0.85, water: 0.72, pop: 2.5,  gov: 0.30 },
  { id: 'mena',     name: 'MENA & Gulf',             shock: 0.78, adaptive: 0.38, institutional: 0.36, hazard: 0.84, outlook: -0.42, heat: 0.85, water: 0.85, pop: 1.4,  gov: 0.40 },
  { id: 'sasia',    name: 'South Asia',              shock: 0.80, adaptive: 0.30, institutional: 0.33, hazard: 0.82, outlook: -0.48, heat: 0.80, water: 0.80, pop: 1.3,  gov: 0.35 },
  { id: 'seap',     name: 'Southeast Asia & Pacific', shock: 0.68, adaptive: 0.42, institutional: 0.40, hazard: 0.72, outlook: -0.28, heat: 0.70, water: 0.50, pop: 1.2,  gov: 0.45 },
  { id: 'latam',    name: 'Latin America & Caribbean', shock: 0.58, adaptive: 0.46, institutional: 0.42, hazard: 0.60, outlook: -0.18, heat: 0.60, water: 0.50, pop: 0.95, gov: 0.48 },
  { id: 'casia',    name: 'Central Asia',            shock: 0.66, adaptive: 0.34, institutional: 0.32, hazard: 0.70, outlook: -0.34, heat: 0.60, water: 0.80, pop: 1.1,  gov: 0.34 },
  { id: 'easia',    name: 'East Asia',               shock: 0.52, adaptive: 0.62, institutional: 0.58, hazard: 0.48, outlook: -0.10, heat: 0.40, water: 0.50, pop: 0.7,  gov: 0.62 },
  { id: 'west',     name: 'Western core',            shock: 0.34, adaptive: 0.78, institutional: 0.72, hazard: 0.30, outlook: 0.12,  heat: 0.25, water: 0.30, pop: 0.9,  gov: 0.78 }
];

APX.YEARS = [2025, 2030, 2035, 2040, 2045, 2050, 2055, 2060, 2065, 2070, 2075, 2080, 2085, 2090, 2095, 2100];

/* Shock exposure trajectories (index 0–1) by region, 2025→2100. */
APX.SHOCK_SERIES = {
  'Sub-Saharan Africa':      [0.82, 0.84, 0.86, 0.88, 0.89, 0.90, 0.91, 0.91, 0.92, 0.92, 0.93, 0.93, 0.93, 0.94, 0.94, 0.94],
  'MENA & Gulf':             [0.78, 0.80, 0.81, 0.83, 0.84, 0.85, 0.85, 0.86, 0.86, 0.87, 0.87, 0.87, 0.88, 0.88, 0.88, 0.88],
  'South Asia':              [0.80, 0.82, 0.83, 0.85, 0.86, 0.87, 0.87, 0.88, 0.88, 0.89, 0.89, 0.89, 0.90, 0.90, 0.90, 0.90],
  'Southeast Asia & Pacific':[0.68, 0.70, 0.71, 0.73, 0.74, 0.75, 0.76, 0.76, 0.77, 0.77, 0.78, 0.78, 0.78, 0.79, 0.79, 0.79],
  'Latin America & Caribbean':[0.58, 0.60, 0.61, 0.63, 0.64, 0.65, 0.66, 0.66, 0.67, 0.67, 0.68, 0.68, 0.68, 0.69, 0.69, 0.69],
  'Central Asia':            [0.66, 0.68, 0.69, 0.71, 0.72, 0.73, 0.73, 0.74, 0.74, 0.75, 0.75, 0.75, 0.76, 0.76, 0.76, 0.76],
  'East Asia':               [0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.58, 0.59, 0.59, 0.60, 0.60, 0.60, 0.61, 0.61, 0.61],
  'Western core':            [0.34, 0.35, 0.36, 0.37, 0.38, 0.39, 0.39, 0.40, 0.40, 0.41, 0.41, 0.41, 0.42, 0.42, 0.42, 0.42]
};

APX.OUTLOOK_SERIES = {
  current:    [0.00, -0.04, -0.08, -0.12, -0.15, -0.18, -0.21, -0.24, -0.27, -0.30, -0.33, -0.36, -0.39, -0.42, -0.45, -0.48],
  adaptation: [0.00,  0.06,  0.12,  0.18,  0.23,  0.28,  0.32,  0.36,  0.39,  0.42,  0.45,  0.48,  0.51,  0.54,  0.56,  0.58],
  cascade:    [0.00, -0.08, -0.16, -0.24, -0.31, -0.38, -0.44, -0.50, -0.56, -0.61, -0.66, -0.70, -0.74, -0.78, -0.81, -0.84]
};

APX.COUPLING = [
  { year: 2025, value: 0.68 },
  { year: 2030, value: 0.71 },
  { year: 2040, value: 0.76 },
  { year: 2050, value: 0.81 },
  { year: 2060, value: 0.84 },
  { year: 2075, value: 0.87 },
  { year: 2100, value: 0.90 }
];

APX.BUFFER = {
  years: [2025, 2050, 2100, 2200, 2500, 3000, 5000, 10000],
  current:    [100, 88, 74, 63, 48, 37, 24, 15],
  adaptation: [100, 94, 86, 79, 68, 58, 46, 36],
  floor: 20
};

APX.RADAR = {
  labels: ['Shock exposure', 'Adaptive capacity', 'Institutional resilience', 'Compound hazard', 'Fiscal headroom'],
  fragile:   [82, 24, 28, 86, 22],
  adaptive:  [52, 62, 58, 48, 66]
};

APX.VECTORS = [
  { label: 'Population in compound-shock zones', value: 4.1,  unit: 'B people' },
  { label: 'Median adaptive capacity',           value: 0.41, unit: ' / 1.00' },
  { label: 'Institutional resilience gap',       value: 0.34, unit: ' index pts' },
  { label: 'Cascade coupling strength',          value: 0.68, unit: ' index' },
  { label: 'Adaptation finance shortfall',       value: 366,  unit: ' $B / yr' }
];

APX.INST_BY_REGION = [
  { label: 'Sub-Saharan Africa',      value: 0.28 },
  { label: 'MENA & Gulf',             value: 0.36 },
  { label: 'South Asia',              value: 0.33 },
  { label: 'Southeast Asia & Pacific', value: 0.40 },
  { label: 'Latin America & Caribbean', value: 0.42 },
  { label: 'Central Asia',            value: 0.32 },
  { label: 'East Asia',               value: 0.58 },
  { label: 'Western core',            value: 0.72 }
];

APX.ADAPTIVE_BY_REGION = [
  { label: 'Sub-Saharan Africa',      value: 0.24 },
  { label: 'MENA & Gulf',             value: 0.38 },
  { label: 'South Asia',              value: 0.30 },
  { label: 'Southeast Asia & Pacific', value: 0.42 },
  { label: 'Latin America & Caribbean', value: 0.46 },
  { label: 'Central Asia',            value: 0.34 },
  { label: 'East Asia',               value: 0.62 },
  { label: 'Western core',            value: 0.78 }
];

APX.HAZARD_SHARE = {
  labels: ['Sub-Saharan Africa', 'MENA & Gulf', 'South Asia', 'SE Asia & Pacific', 'Latin America', 'Central Asia', 'East Asia', 'Western core'],
  y2025: [0.86, 0.84, 0.82, 0.72, 0.60, 0.70, 0.48, 0.30],
  y2050: [0.93, 0.90, 0.88, 0.78, 0.66, 0.75, 0.52, 0.34]
};
