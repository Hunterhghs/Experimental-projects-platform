// Single source of truth for platform-wide settings.
// SITE_URL can be overridden at build time (e.g. in Cloudflare Pages env vars).

export const SITE = {
  url: process.env.SITE_URL || 'https://projects.hheuristics.com',
  name: 'H Heuristics Projects',
  shortName: 'Projects',
  publisher: 'H Heuristics',
  publisherUrl: 'https://hheuristics.com',
  tagline: 'Navigating a changing world',
  description:
    'Research reports, experimental dashboards and analytical projects from H Heuristics on systemic risk, climate, public health, development and the energy transition.',
  defaultAuthor: { name: 'Hunter Hughes', role: 'Founder & CEO, H Heuristics' },
  // Identifier printed on every project: "HX-2026-001"
  numberPrefix: 'HX',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  locale: 'en_US',
  language: 'en',
  pageSize: 24,
  sister: [
    { label: 'Research Reports', url: 'https://researchreports.hheuristics.com' },
    { label: 'Digital Reports', url: 'https://digitalreports.hheuristics.com' },
  ],
};

// Project types. Add a new type here and in src/content.config.ts to get
// listing pages, routes, search filters and feeds for it automatically.
export const TYPES = {
  report: {
    section: 'reports',
    label: 'Report',
    plural: 'Reports',
    blurb: 'Long-form research monographs with exhibits, tables and full references.',
  },
  dashboard: {
    section: 'dashboards',
    label: 'Dashboard',
    plural: 'Dashboards',
    blurb: 'Interactive, data-driven dashboards and experimental visual tools.',
  },
  project: {
    section: 'projects',
    label: 'Project',
    plural: 'Projects',
    blurb: 'Models, datasets, maps and other experimental analytical work.',
  },
};
