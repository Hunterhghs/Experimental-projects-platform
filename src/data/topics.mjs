// Controlled topic vocabulary. Every project's `topics` must use these ids,
// which keeps topic pages consistent across thousands of projects.
// `match` is used by scripts/ingest.mjs to suggest topics from document text.

export const TOPICS = [
  { id: 'air-quality', label: 'Air Quality', match: /air pollution|air quality|particulate|pm2\.5|ozone|smog|aerosol/gi,
    description: 'Ambient and household air pollution, atmospheric chemistry and clean-air policy.' },
  { id: 'climate', label: 'Climate Change', match: /climate|warming|greenhouse|methane|carbon dioxide|emissions/gi,
    description: 'Physical climate risk, mitigation pathways and short-lived climate pollutants.' },
  { id: 'climate-adaptation', label: 'Climate Adaptation', match: /adaptation|resilience|heat stress|extreme heat|flood/gi,
    description: 'Adaptation finance, resilience and living with a hotter, more volatile climate.' },
  { id: 'public-health', label: 'Public Health', match: /mortality|disease|health|epidemiolog|cardiovascular|respiratory/gi,
    description: 'Disease burdens, epidemiology and health systems under systemic stress.' },
  { id: 'energy-transition', label: 'Energy Transition', match: /energy transition|renewable|solar|coal|fossil fuel|electrif|clean energy/gi,
    description: 'Decarbonisation, clean-technology diffusion and energy access.' },
  { id: 'food-security', label: 'Food Security', match: /crop|yield|food|agricultur|harvest|famine/gi,
    description: 'Agricultural productivity, food systems and nutrition risk.' },
  { id: 'water', label: 'Water', match: /water scarcity|drought|aquifer|freshwater|irrigation/gi,
    description: 'Water scarcity, hydrological risk and system degradation.' },
  { id: 'ecosystems', label: 'Ecosystems & Biodiversity', match: /ecosystem|biodiversity|forest|species|acid deposition/gi,
    description: 'Ecological degradation, biodiversity loss and natural capital.' },
  { id: 'economics', label: 'Economics & Productivity', match: /econom|gdp|productivity|labor|labour|capital|fiscal/gi,
    description: 'Macroeconomic costs, productivity, human capital and fiscal exposure.' },
  { id: 'development', label: 'Development', match: /developing (nations|countries)|global south|poverty|low-income|development finance/gi,
    description: 'Development finance, poverty traps and convergence in the Global South.' },
  { id: 'governance', label: 'Policy & Governance', match: /governance|policy|regulat|treaty|mandate|standard/gi,
    description: 'Institutions, regulation, treaties and the politics of implementation.' },
  { id: 'technology', label: 'Technology & Data', match: /satellite|remote sensing|sensor|telemetry|artificial intelligence|machine learning/gi,
    description: 'Monitoring technology, AI, data infrastructure and innovation.' },
  { id: 'demography', label: 'Demography', match: /demograph|population growth|fertility|migration|diaspora/gi,
    description: 'Population change, migration and demographic transition.' },
  { id: 'geopolitics', label: 'Geopolitics & Security', match: /geopolit|conflict|security|war|sanction/gi,
    description: 'Conflict, security and the shifting international order.' },
  { id: 'systemic-risk', label: 'Systemic Risk', match: /polycrisis|systemic|cascad|compound|feedback loop|tipping point/gi,
    description: 'Polycrisis, compound shocks and interacting global risks.' },
  { id: 'urbanization', label: 'Cities & Urbanization', match: /urban|cities|megacit|transport|traffic/gi,
    description: 'Urban systems, transport and the built environment.' },
];

export const TOPIC_IDS = TOPICS.map((t) => t.id);
export const topicById = (id) => TOPICS.find((t) => t.id === id);
