/* ============================================================
   POLYCRISIS RESILIENCE MONITOR — application logic
   Fixed webapp console · Leaflet vector map (no tiles) · Chart.js
   ============================================================ */
'use strict';

(function () {
  const A = window.APX;
  const $ = (id) => document.getElementById(id);

  const GOLD = '#e8b95c', EMBER = '#e0603f', TOXIC = '#d94f4f', TEAL = '#35c7b8',
        VIOLET = '#8f6fd0', SLATE = '#5b7087', MUTED = '#7c8ba0', FAINT = '#55637a';

  const state = {
    metric: 'shock',
    scenario: 'current',
    year: 2025,
    playing: false,
    playTimer: null
  };

  const SEQ_STOPS = ['#16222f', '#2f3c4d', '#6e5a35', '#c9a227', '#d97b3a', '#d94f4f'];
  const DIVERGE = { low: '#d94f4f', mid: SLATE, high: TEAL };

  const METRICS = {
    shock:        { kind: 'seq', domain: [0, 1], stops: SEQ_STOPS, label: 'Shock exposure index', fmt: (v) => v.toFixed(2), time: true },
    adaptive:     { kind: 'div', domain: [0, 1], mid: 0.5, low: '#d94f4f', midC: SLATE, high: TEAL, label: 'Adaptive capacity index', fmt: (v) => v.toFixed(2), time: false },
    institutional:{ kind: 'seq', domain: [0, 1], stops: SEQ_STOPS, label: 'Institutional resilience', fmt: (v) => v.toFixed(2), time: false },
    hazard:       { kind: 'seq', domain: [0, 1], stops: SEQ_STOPS, label: 'Compound hazard load', fmt: (v) => v.toFixed(2), time: false },
    outlook:      { kind: 'div', domain: [-1, 1], mid: 0, low: '#d94f4f', midC: SLATE, high: TEAL, label: 'Resilience outlook', fmt: (v) => (v > 0 ? '+' : '') + v.toFixed(2), time: false }
  };

  const SCENARIOS = {
    current:    { label: 'Current trajectory', mult: { shock: 1.00, adaptive: 1.00, institutional: 1.00, hazard: 1.00, outlook: 1.00 } },
    adaptation: { label: 'Adaptation push',    mult: { shock: 0.82, adaptive: 1.28, institutional: 1.15, hazard: 0.88, outlook: 2.40 } },
    cascade:    { label: 'Polycrisis cascade', mult: { shock: 1.22, adaptive: 0.78, institutional: 0.72, hazard: 1.18, outlook: -1.00 } }
  };

  const REGION_RULES = [
    { re: /Africa|Congo|Sahara|Somaliland|Sudan|Ethiopia|Eritrea|Djibouti|Uganda|Kenya|Tanzania|Zambia|Zimbabwe|Malawi|Mozambique|Angola|Nigeria|Niger|Mali|Chad|Senegal|Gambia|Guinea|Sierra Leone|Liberia|Côte|Togo|Benin|Burkina|Ghana|Cameroon|Gabon|Burundi|Rwanda|Madagascar|Mauritania|Lesotho|eSwatini|Botswana|Namibia|Cabo Verde|Comoros|Mauritius|Seychelles|Eq\./, p: { shock: 0.82, adaptive: 0.24, institutional: 0.28, hazard: 0.86, outlook: -0.55, heat: 0.85, water: 0.72, pop: 2.5, gov: 0.30 } },
    { re: /Saudi|Yemen|Oman|Emirates|Qatar|Bahrain|Kuwait|Iraq|Iran|Jordan|Lebanon|Syria|Palestine|Israel|Egypt|Libya|Tunisia|Algeria|Morocco/, p: { shock: 0.78, adaptive: 0.38, institutional: 0.36, hazard: 0.84, outlook: -0.42, heat: 0.85, water: 0.85, pop: 1.4, gov: 0.40 } },
    { re: /India|Pakistan|Bangladesh|Nepal|Bhutan|Sri Lanka|Maldives|Afghanistan/, p: { shock: 0.80, adaptive: 0.30, institutional: 0.33, hazard: 0.82, outlook: -0.48, heat: 0.80, water: 0.80, pop: 1.3, gov: 0.35 } },
    { re: /Indonesia|Philippines|Malaysia|Brunei|Timor|Laos|Cambodia|Myanmar|Thailand|Vietnam|Papua|Solomon|Vanuatu|Fiji|Samoa|Tonga|Micronesia|Kiribati|Marshall|Nauru|Palau|Tuvalu|New Caledonia/, p: { shock: 0.68, adaptive: 0.42, institutional: 0.40, hazard: 0.72, outlook: -0.28, heat: 0.70, water: 0.50, pop: 1.2, gov: 0.45 } },
    { re: /Mexico|Brazil|Colombia|Peru|Bolivia|Venezuela|Ecuador|Guyana|Suriname|Paraguay|Uruguay|Argentina|Chile|Guatemala|Belize|Honduras|El Salvador|Nicaragua|Costa Rica|Panama|Cuba|Haiti|Dominican|Jamaica|Trinidad|Bahamas|Barbados|Grenada|St\./, p: { shock: 0.58, adaptive: 0.46, institutional: 0.42, hazard: 0.60, outlook: -0.18, heat: 0.60, water: 0.50, pop: 0.95, gov: 0.48 } },
    { re: /Kazakhstan|Uzbekistan|Turkmenistan|Kyrgyzstan|Tajikistan/, p: { shock: 0.66, adaptive: 0.34, institutional: 0.32, hazard: 0.70, outlook: -0.34, heat: 0.60, water: 0.80, pop: 1.1, gov: 0.34 } },
    { re: /China|Taiwan|Korea|Japan|Mongolia/, p: { shock: 0.52, adaptive: 0.62, institutional: 0.58, hazard: 0.48, outlook: -0.10, heat: 0.40, water: 0.50, pop: 0.7, gov: 0.62 } },
    { re: /United States|Canada|Greenland|United Kingdom|Ireland|France|Germany|Spain|Portugal|Italy|Greece|Austria|Switzerland|Belgium|Netherlands|Luxembourg|Denmark|Norway|Sweden|Finland|Iceland|Poland|Czech|Slovak|Hungary|Romania|Bulgaria|Serbia|Croatia|Slovenia|Bosnia|Montenegro|Macedonia|Albania|Estonia|Latvia|Lithuania|Belarus|Ukraine|Moldova|Russia|Australia|New Zealand|Malta|Cyprus/, p: { shock: 0.34, adaptive: 0.78, institutional: 0.72, hazard: 0.30, outlook: 0.12, heat: 0.25, water: 0.30, pop: 0.9, gov: 0.78 } },
    { re: /./, p: { shock: 0.55, adaptive: 0.50, institutional: 0.50, hazard: 0.55, outlook: -0.05, heat: 0.50, water: 0.50, pop: 1.0, gov: 0.50 } }
  ];

  function profileFor(name) {
    for (let i = 0; i < REGION_RULES.length; i++) {
      if (REGION_RULES[i].re.test(name)) return REGION_RULES[i].p;
    }
    return REGION_RULES[REGION_RULES.length - 1].p;
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const growthScore = (pop) => clamp((pop - 0.5) / 3, 0, 1);

  function metricValue(name, metric) {
    const p = profileFor(name);
    const sc = SCENARIOS[state.scenario].mult;
    let v;
    if (metric === 'shock') {
      const base = 0.55 * p.hazard + 0.25 * (1 - p.adaptive) + 0.20 * growthScore(p.pop);
      const t = (state.year - 2025) / 75;
      v = base * (1 + 0.28 * t) * sc.shock;
    } else if (metric === 'adaptive') {
      v = p.adaptive * sc.adaptive;
    } else if (metric === 'institutional') {
      v = (0.6 * p.gov + 0.4 * (1 - p.hazard)) * sc.institutional;
    } else if (metric === 'hazard') {
      v = (0.5 * p.heat + 0.5 * p.water + p.hazard) / 2 * sc.hazard;
    } else { // outlook
      v = p.outlook * (sc.outlook < 0 ? -sc.outlook : sc.outlook);
      if (state.scenario === 'cascade') v = p.outlook * 2.10;
    }
    return clamp(v, METRICS[metric].domain[0], METRICS[metric].domain[1]);
  }

  /* ---------------- color helpers ---------------- */
  function hexRgb(h) {
    h = String(h).replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mix(a, b, t) {
    t = clamp(t, 0, 1);
    const A = hexRgb(a), B = hexRgb(b);
    return 'rgb(' + Math.round(A[0] + (B[0] - A[0]) * t) + ',' + Math.round(A[1] + (B[1] - A[1]) * t) + ',' + Math.round(A[2] + (B[2] - A[2]) * t) + ')';
  }
  function colorFor(v, metric) {
    const m = METRICS[metric];
    if (m.kind === 'seq') {
      const t = clamp((v - m.domain[0]) / (m.domain[1] - m.domain[0]), 0, 1);
      const x = t * (m.stops.length - 1);
      const i = Math.floor(x);
      return mix(m.stops[i], m.stops[i + 1] || m.stops[m.stops.length - 1], x - i);
    }
    const mid = m.mid, d = m.domain;
    if (v >= mid) {
      const t = clamp((v - mid) / (d[1] - mid), 0, 1);
      return mix(m.midC, m.high, t);
    }
    const t = clamp((mid - v) / (mid - d[0]), 0, 1);
    return mix(m.midC, m.low, t);
  }

  /* ---------------- map ---------------- */
  let map, layer;
  function initMap() {
    map = L.map('map', { zoomControl: true, attributionControl: false, minZoom: 1.5, maxZoom: 7, worldCopyJump: true }).setView([22, 12], 2.1);
    layer = L.geoJSON(window.COUNTRIES_GEOJSON, {
      style: (f) => ({ fillColor: colorFor(metricValue(f.properties.name, state.metric), state.metric), weight: 0.6, color: 'rgba(232,185,92,.28)', fillOpacity: 0.92 }),
      onEachFeature: (f, lyr) => {
        lyr.bindTooltip(() => {
          const v = metricValue(f.properties.name, state.metric);
          return '<b>' + f.properties.name + '</b><br>' + METRICS[state.metric].label + ': ' + METRICS[state.metric].fmt(v);
        }, { sticky: true, className: 'apx-tip' });
      }
    }).addTo(map);
  }
  function redrawMap() {
    if (!layer) return;
    layer.setStyle((f) => ({ fillColor: colorFor(metricValue(f.properties.name, state.metric), state.metric), weight: 0.6, color: 'rgba(232,185,92,.28)', fillOpacity: 0.92 }));
    const m = METRICS[state.metric];
    $('mapNote').textContent = 'Metric: ' + m.label + (m.time ? ' · Year ' + state.year : ' · time-static metric') + ' · local vector geometry, no tile service';
    $('mapLegendTitle').textContent = m.label;
    $('mapLegendLow').textContent = String(m.domain[0]);
    $('mapLegendHigh').textContent = String(m.domain[1]);
    $('mapLegendGrad').style.background = m.kind === 'seq'
      ? 'linear-gradient(90deg,' + m.stops.join(',') + ')'
      : 'linear-gradient(90deg,' + m.low + ',' + m.midC + ',' + m.high + ')';
  }

  /* ---------------- charts ---------------- */
  const charts = {};
  const baseOpts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
    plugins: { legend: { labels: { color: MUTED, boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 9, family: 'ui-monospace,monospace' } } } },
    scales: {
      x: { ticks: { color: FAINT, font: { size: 8, family: 'ui-monospace,monospace' } }, grid: { color: 'rgba(255,255,255,.04)' } },
      y: { ticks: { color: FAINT, font: { size: 8, family: 'ui-monospace,monospace' } }, grid: { color: 'rgba(255,255,255,.04)' } }
    }
  };
  function mk(id, cfg) {
    const el = $(id);
    if (!el) return null;
    charts[id] = new Chart(el, cfg);
    return charts[id];
  }
  function buildCharts() {
    mk('cTfr', { type: 'bar', data: { labels: A.INST_BY_REGION.map(r => r.label), datasets: [{ label: 'Institutional resilience', data: A.INST_BY_REGION.map(r => r.value), backgroundColor: A.INST_BY_REGION.map(r => r.value >= 0.5 ? TEAL : EMBER) }] }, options: Object.assign({}, baseOpts, { plugins: { legend: { display: false } } }) });

    mk('cPop', { type: 'line', data: { labels: A.YEARS, datasets: Object.keys(A.SHOCK_SERIES).map((k, i) => ({ label: k, data: A.SHOCK_SERIES[k], borderColor: [EMBER, TOXIC, '#c9a227', TEAL, VIOLET, '#35c7b8', GOLD, SLATE][i], borderWidth: 2, pointRadius: 0, tension: 0.25 })) }, options: baseOpts });

    mk('cNiche', { type: 'bar', data: { labels: A.ADAPTIVE_BY_REGION.map(r => r.label), datasets: [{ label: 'Adaptive capacity', data: A.ADAPTIVE_BY_REGION.map(r => r.value), backgroundColor: A.ADAPTIVE_BY_REGION.map(r => r.value >= 0.5 ? TEAL : EMBER) }] }, options: Object.assign({}, baseOpts, { plugins: { legend: { display: false } } }) });

    mk('cShare', { type: 'bar', data: { labels: A.HAZARD_SHARE.labels, datasets: [{ label: '2025', data: A.HAZARD_SHARE.y2025, backgroundColor: 'rgba(224,96,63,.75)' }, { label: '2050', data: A.HAZARD_SHARE.y2050, backgroundColor: 'rgba(232,185,92,.75)' }] }, options: baseOpts });

    mk('cDeepTime', { type: 'line', data: { labels: A.YEARS, datasets: [{ label: 'Current trajectory', data: A.OUTLOOK_SERIES.current, borderColor: TOXIC, borderWidth: 2, pointRadius: 0, tension: 0.3 }, { label: 'Adaptation push', data: A.OUTLOOK_SERIES.adaptation, borderColor: TEAL, borderWidth: 2, pointRadius: 0, tension: 0.3 }] }, options: baseOpts });

    mk('cCarbon', { type: 'line', data: { labels: A.COUPLING.map(c => c.year), datasets: [{ label: 'Cascade coupling', data: A.COUPLING.map(c => c.value), borderColor: EMBER, borderWidth: 2.5, pointRadius: 3, tension: 0.3 }] }, options: Object.assign({}, baseOpts, { plugins: { legend: { display: false } } }) });

    mk('cRadar', { type: 'radar', data: { labels: A.RADAR.labels, datasets: [{ label: 'Fragile frontier', data: A.RADAR.fragile, borderColor: TOXIC, backgroundColor: 'rgba(217,79,79,.15)', pointBackgroundColor: TOXIC }, { label: 'Adaptive core', data: A.RADAR.adaptive, borderColor: TEAL, backgroundColor: 'rgba(53,199,184,.15)', pointBackgroundColor: TEAL }] }, options: Object.assign({}, baseOpts, { scales: { r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,.08)' }, angleLines: { color: 'rgba(255,255,255,.08)' }, pointLabels: { color: MUTED, font: { size: 8, family: 'ui-monospace,monospace' } } } }, plugins: { legend: { labels: { color: MUTED, boxWidth: 8, boxHeight: 8, font: { size: 9, family: 'ui-monospace,monospace' } } } } }) });

    mk('cVectors', { type: 'bar', data: { labels: A.VECTORS.map(v => v.label), datasets: [{ label: 'Vector magnitude', data: A.VECTORS.map(v => v.value), backgroundColor: [TOXIC, EMBER, TOXIC, EMBER, TOXIC] }] }, options: Object.assign({}, baseOpts, { indexAxis: 'y', plugins: { legend: { display: false } } }) });

    mk('cAttrition', { type: 'line', data: { labels: A.BUFFER.years, datasets: [{ label: 'Current trajectory', data: A.BUFFER.current, borderColor: TOXIC, borderWidth: 2, pointRadius: 2, tension: 0.25 }, { label: 'Adaptation push', data: A.BUFFER.adaptation, borderColor: TEAL, borderWidth: 2, pointRadius: 2, tension: 0.25 }] }, options: Object.assign({}, baseOpts, { scales: { x: { type: 'logarithmic' } } }) });
  }

  /* ---------------- controls ---------------- */
  function bindControls() {
    $('metricSelect').addEventListener('change', (e) => {
      state.metric = e.target.value;
      const timeActive = METRICS[state.metric].time;
      $('timelineNote').textContent = timeActive ? ' · year-varying' : ' · time-static';
      $('yearSlider').disabled = !timeActive;
      $('playBtn').disabled = !timeActive;
      redrawMap();
    });
    document.querySelectorAll('#scenarioRow button').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#scenarioRow button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.scenario = btn.dataset.scen;
        redrawMap();
      });
    });
    $('yearSlider').addEventListener('input', (e) => {
      state.year = Number(e.target.value);
      $('yearReadout').textContent = state.year;
      if (METRICS[state.metric].time) redrawMap();
    });
    $('playBtn').addEventListener('click', () => {
      if (!METRICS[state.metric].time) return;
      if (state.playing) stopPlay(); else startPlay();
    });
    $('sideToggle').addEventListener('click', () => $('sidebar').classList.toggle('collapsed'));
    $('menuBtn').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  }
  function startPlay() {
    state.playing = true;
    $('playBtn').textContent = '■ STOP';
    state.playTimer = setInterval(() => {
      let y = state.year + 5;
      if (y > 2100) y = 2025;
      state.year = y;
      $('yearSlider').value = y;
      $('yearReadout').textContent = y;
      if (METRICS[state.metric].time) redrawMap();
    }, 650);
  }
  function stopPlay() {
    state.playing = false;
    if (state.playTimer) clearInterval(state.playTimer);
    state.playTimer = null;
    $('playBtn').textContent = '▶ PLAY';
  }

  /* ---------------- clock + scrollspy ---------------- */
  function tickClock() {
    const d = new Date();
    $('clock').textContent = d.toISOString().slice(11, 19) + ' UTC';
  }
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('#navSections a'));
    const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const stage = $('stage');
    stage.addEventListener('scroll', () => {
      const top = stage.scrollTop + 90;
      let current = sections[0] ? sections[0].id : null;
      sections.forEach(s => { if (s.offsetTop <= top) current = s.id; });
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    }, { passive: true });
  }

  function init() {
    initMap();
    buildCharts();
    bindControls();
    initScrollSpy();
    tickClock();
    setInterval(tickClock, 1000);
    $('yearReadout').textContent = state.year;
    $('timelineNote').textContent = ' · year-varying';
    redrawMap();
  }
  init();
})();
