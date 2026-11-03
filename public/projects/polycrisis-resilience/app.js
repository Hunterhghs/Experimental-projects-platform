/* Polycrisis Resilience explainer, vanilla JS, no dependencies.
   All figures from H Heuristics report HH-2026-51 (HH-PRM v2.0). */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svgEl = (tag, attrs = {}) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  /* ---------- NAV ---------- */
  const nav = $(".nav");
  $(".nav__toggle").addEventListener("click", (e) => {
    const open = nav.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
  $$(".nav__links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  const bar = $(".progress span");
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__links a");
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    let cur = "";
    sections.forEach((s) => { if (s.getBoundingClientRect().top < 120) cur = s.id; });
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + cur));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- REVEAL & DEFERRED ANIMATIONS ---------- */
  const onVisible = (el, fn, threshold = 0.25) => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { fn(en.target); io.unobserve(en.target); } });
    }, { threshold });
    io.observe(el);
  };
  $$(".section__head, .card, .era, .pcard, .playbook li, .hsrd > div, .callout, .cascade").forEach((el) => {
    el.classList.add("reveal");
    onVisible(el, (t) => t.classList.add("is-in"), 0.1);
  });

  /* ---------- HERO COUNTER ---------- */
  const countUp = (el, target, dur = 2200) => {
    if (reduce) { el.textContent = target; return; }
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$(".count").forEach((el) => countUp(el, +el.dataset.target));

  /* ---------- HERO CANVAS: interconnected nodes ---------- */
  const cv = $("#heroCanvas");
  const ctx = cv.getContext("2d");
  let W, H, pts = [];
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (W * H) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      c: Math.random() < 0.18 ? "#f2b84b" : "#38d6b0",
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 17000) {
          ctx.strokeStyle = `rgba(140,170,220,${0.18 * (1 - d / 17000)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = a.c;
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  resize(); draw();
  window.addEventListener("resize", resize);

  /* ---------- THREAT NETWORK ---------- */
  const threats = [
    { id: "climate", ico: "🌡️", name: "Climate & extreme weather", desc: "Heatwaves, megadroughts, floods and storms destroy crops, damage grids and expand the range of mosquitoes and waterborne pathogens.", links: ["food", "water", "disease", "infra", "poverty", "conflict"] },
    { id: "air", ico: "🏭", name: "Air pollution", desc: "PM2.5 and smoke from coal, diesel and household cooking fuels cause strokes, heart attacks, lung disease and childhood pneumonia.", links: ["disease", "climate", "poverty"] },
    { id: "poverty", ico: "💸", name: "Poverty & fragility", desc: "Over 3.8B people lack adequate social protection. Poverty pushes families into floodplains, onto dirty fuels, and away from medical care.", links: ["air", "food", "water", "disease", "conflict"] },
    { id: "food", ico: "🌾", name: "Food insecurity", desc: "733M face chronic hunger. Undernutrition in the first 1,000 days stunts immune defences, turning common infections into killers.", links: ["disease", "conflict", "poverty"] },
    { id: "water", ico: "💧", name: "Water & sanitation", desc: "2.1B lack safe water and 3.4B lack safe sanitation, spreading cholera, typhoid and dysentery while crippling irrigated farming.", links: ["disease", "food", "conflict"] },
    { id: "disease", ico: "🦠", name: "Infectious disease", desc: "Malaria, TB, HIV, pneumonia, superbugs and novel pandemics thrive wherever primary care is weak and surveillance is blind.", links: ["poverty", "food", "conflict"] },
    { id: "conflict", ico: "⚔️", name: "Conflict & fragility", desc: "War destroys hospitals, water plants and grids, displaces families into crowded camps and blocks food and vaccine deliveries.", links: ["food", "water", "disease", "infra", "poverty"] },
    { id: "infra", ico: "🔌", name: "Weak infrastructure", desc: "Without power, roads, cold chains, drainage and early warnings, every environmental or economic tremor reaches human bodies unfiltered.", links: ["water", "disease", "food", "climate"] },
  ];
  const g = $("#threatGraph");
  const cx = 260, cy = 260, R = 185;
  threats.forEach((t, i) => {
    const a = (i / threats.length) * Math.PI * 2 - Math.PI / 2;
    t.x = cx + R * Math.cos(a); t.y = cy + R * Math.sin(a);
  });
  const edgeG = svgEl("g"), nodeG = svgEl("g");
  g.append(edgeG, nodeG);
  const edges = [];
  const seen = new Set();
  threats.forEach((t) => t.links.forEach((l) => {
    const key = [t.id, l].sort().join("-");
    if (seen.has(key)) return;
    seen.add(key);
    const o = threats.find((x) => x.id === l);
    const mx = (t.x + o.x) / 2, my = (t.y + o.y) / 2;
    const qx = mx + (cx - mx) * 0.35, qy = my + (cy - my) * 0.35;
    const p = svgEl("path", { d: `M${t.x},${t.y} Q${qx},${qy} ${o.x},${o.y}`, class: "edge", fill: "none" });
    p.dataset.a = t.id; p.dataset.b = l;
    edgeG.append(p); edges.push(p);
  }));
  const linksOf = (id) => {
    const s = new Set(threats.find((t) => t.id === id).links);
    threats.forEach((t) => { if (t.links.includes(id)) s.add(t.id); });
    return s;
  };
  const detail = $("#threatDetail");
  const defaultDetail = detail.innerHTML;
  const select = (id) => {
    const linked = id ? linksOf(id) : new Set();
    $$(".node", g).forEach((n) => {
      n.classList.toggle("on", n.dataset.id === id);
      n.classList.toggle("linked", linked.has(n.dataset.id));
    });
    edges.forEach((e) => e.classList.toggle("on", !!id && (e.dataset.a === id || e.dataset.b === id)));
    if (!id) { detail.innerHTML = defaultDetail; return; }
    const t = threats.find((x) => x.id === id);
    detail.innerHTML = `<p class="kicker">Threat</p><h3>${t.ico} ${t.name}</h3><p>${t.desc}</p>
      <p class="muted" style="margin:1.2rem 0 0">Connected to ${linked.size} other threats:</p>
      <div class="links-list">${[...linked].map((l) => `<span>${threats.find((x) => x.id === l).name}</span>`).join("")}</div>`;
  };
  threats.forEach((t) => {
    const n = svgEl("g", { class: "node", tabindex: "0", role: "button", "aria-label": t.name });
    n.dataset.id = t.id;
    n.append(svgEl("circle", { cx: t.x, cy: t.y, r: 30 }));
    const ic = svgEl("text", { x: t.x, y: t.y, class: "ico" }); ic.textContent = t.ico;
    const below = t.y >= cy;
    const lb = svgEl("text", { x: t.x, y: below ? t.y + 50 : t.y - 40, class: "lbl" });
    lb.textContent = t.name.split(" & ")[0];
    n.append(ic, lb);
    n.addEventListener("mouseenter", () => select(t.id));
    n.addEventListener("focus", () => select(t.id));
    n.addEventListener("click", () => select(t.id));
    nodeG.append(n);
  });
  // cycle a demo until the user interacts
  let demoI = 0, userTouched = false;
  g.addEventListener("pointerenter", () => { userTouched = true; }, { once: true });
  onVisible(g, () => {
    const iv = setInterval(() => {
      if (userTouched || reduce) { clearInterval(iv); return; }
      select(threats[demoI++ % threats.length].id);
    }, 2600);
  });

  // cascade light-up
  onVisible($(".cascade"), () => {
    $$(".cascade__steps li").forEach((li, i) => setTimeout(() => li.classList.add("lit"), 350 * i));
  });

  /* ---------- FOUR FUTURES CHART ---------- */
  const scenarios = [
    { key: "S0", name: "Reactive Drift", color: "#6b7590", pts: [[2025, 0], [2100, 0]], total: 0, by2050: 0, by2075: 0, dalys: "—", basic: "2.8B", vuln: "4.0B", warm: "+2.80°C", invest: "—",
      blurb: "Business as usual: crises are handled one at a time, after they strike. About 1.57 billion preventable risk-linked deaths occur this century." },
    { key: "S1", name: "Delayed Action (2040)", color: "#f2667a", pts: [[2025, 0], [2040, 0], [2050, 7], [2075, 98], [2100, 225]], total: 225, by2050: 7, by2075: 98, range: "159–275M", dalys: "8.4B", basic: "2.1B", vuln: "3.5B", warm: "+2.20°C", invest: "$1.35T",
      blurb: "The same coordinated package, but starting in 2040. Waiting 14 years forfeits 143 million lives, and the late start costs more each year at its peak." },
    { key: "S2", name: "Siloed Progress (2026)", color: "#f2b84b", pts: [[2025, 0], [2050, 33], [2075, 134], [2100, 232]], total: 232, by2050: 33, by2075: 134, range: "165–284M", dalys: "8.8B", basic: "1.6B", vuln: "3.2B", warm: "+2.10°C", invest: "$1.15T",
      blurb: "Action starts now, but ministries work alone: energy, health and water projects that don't reinforce each other. Leaves 136 million preventable deaths on the table." },
    { key: "S3", name: "Coordinated Resilience (2026)", color: "#38d6b0", pts: [[2025, 0], [2050, 58], [2075, 213], [2100, 368]], total: 368, by2050: 58, by2075: 213, range: "265–448M", dalys: "13.6B", basic: "0.9B", vuln: "2.3B", warm: "+1.85°C", invest: "$1.20T",
      blurb: "All seven survival pathways scaled together from 2026, so each investment multiplies the others. It saves the most lives at roughly 1% of global GDP." },
  ];
  const fc = $("#futureChart");
  const M = { l: 48, r: 70, t: 20, b: 36 }, CW = 640 - M.l - M.r, CH = 360 - M.t - M.b;
  const xS = (y) => M.l + ((y - 2025) / 75) * CW;
  const yS = (v) => M.t + CH - (v / 400) * CH;

  // monotone cubic interpolation (Fritsch–Carlson) so curves never dip below zero
  const monotonePath = (p) => {
    const n = p.length;
    if (n < 3) return p.map((q, i) => `${i ? "L" : "M"}${xS(q[0])},${yS(q[1])}`).join("");
    const xs = p.map((q) => xS(q[0])), ys = p.map((q) => yS(q[1]));
    const d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
    }
    let s = `M${xs[0]},${ys[0]}`;
    for (let i = 0; i < n - 1; i++) {
      const h = (xs[i + 1] - xs[i]) / 3;
      s += `C${xs[i] + h},${ys[i] + m[i] * h} ${xs[i + 1] - h},${ys[i + 1] - m[i + 1] * h} ${xs[i + 1]},${ys[i + 1]}`;
    }
    return s;
  };

  [0, 100, 200, 300, 400].forEach((v) => {
    fc.append(svgEl("line", { x1: M.l, x2: M.l + CW, y1: yS(v), y2: yS(v), class: "grid" }));
    const t = svgEl("text", { x: M.l - 10, y: yS(v) + 4, "text-anchor": "end", class: "axis" }); t.textContent = v;
    fc.append(t);
  });
  [2025, 2050, 2075, 2100].forEach((y) => {
    const t = svgEl("text", { x: xS(y), y: M.t + CH + 24, "text-anchor": "middle", class: "axis" }); t.textContent = y;
    fc.append(t);
  });
  const defs = svgEl("defs");
  const grad = svgEl("linearGradient", { id: "gS3", x1: 0, x2: 0, y1: 0, y2: 1 });
  grad.append(svgEl("stop", { offset: "0", "stop-color": "#38d6b0", "stop-opacity": ".35" }), svgEl("stop", { offset: "1", "stop-color": "#38d6b0", "stop-opacity": "0" }));
  defs.append(grad); fc.append(defs);
  const area = svgEl("path", { d: monotonePath(scenarios[3].pts) + `L${xS(2100)},${yS(0)}L${xS(2025)},${yS(0)}Z`, fill: "url(#gS3)", class: "area" });
  fc.append(area);
  const lines = scenarios.map((s) => {
    const p = svgEl("path", { d: monotonePath(s.pts), class: "line", stroke: s.color });
    if (s.key === "S0") p.setAttribute("stroke-dasharray", "6 6");
    fc.append(p);
    const len = p.getTotalLength();
    if (!reduce) { p.style.strokeDasharray = s.key === "S0" ? "6 6" : `${len}`; if (s.key !== "S0") p.style.strokeDashoffset = len; }
    const lbl = svgEl("text", { x: xS(2100) + 8, y: yS(s.total) + (s.key === "S1" ? 12 : s.key === "S2" ? -4 : 4), class: "endlbl", fill: s.color });
    lbl.textContent = s.total ? s.total + "M" : "0";
    fc.append(lbl);
    const dots = s.pts.filter((q) => [2050, 2075, 2100].includes(q[0]) && q[1] > 0).map((q) => {
      const c = svgEl("circle", { cx: xS(q[0]), cy: yS(q[1]), r: 4, fill: s.color, class: "pt" });
      const tt = svgEl("title"); tt.textContent = `${s.name}: ${q[1]}M by ${q[0]}`;
      c.append(tt); fc.append(c); return c;
    });
    return { p, lbl, dots, len, s };
  });
  onVisible(fc, () => {
    lines.forEach(({ p, s }, i) => {
      if (reduce || s.key === "S0") return;
      p.style.transition = `stroke-dashoffset 1.6s ${i * 0.25}s cubic-bezier(.3,.7,.2,1)`;
      p.style.strokeDashoffset = 0;
    });
  });

  const scnDetail = $("#scnDetail");
  const showScenario = (i) => {
    const s = scenarios[i];
    $$(".scn").forEach((b) => { b.classList.toggle("is-active", +b.dataset.s === i); b.setAttribute("aria-selected", +b.dataset.s === i); });
    lines.forEach((l, j) => {
      const dim = j !== i && j !== 0;
      l.p.classList.toggle("dim", dim); l.lbl.classList.toggle("dim", dim);
      l.dots.forEach((d) => d.classList.toggle("dim", dim));
      l.p.style.strokeWidth = j === i ? 4 : 2.5;
    });
    area.style.opacity = i === 3 ? 1 : 0.25;
    scnDetail.innerHTML = `
      <p class="kicker" style="color:${s.color}">${s.key}</p>
      <h3>${s.name}</h3>
      <p class="muted">${s.blurb}</p>
      <p class="big" style="color:${s.color}">${s.total ? s.total + "M" : "0"} <small>net lives saved by 2100</small></p>
      ${s.range ? `<p class="note" style="margin:0">90% range: ${s.range}</p>` : ""}
      <dl>
        <dt>Saved by 2050 / 2075</dt><dd>${s.by2050}M / ${s.by2075}M</dd>
        <dt>Healthy life-years</dt><dd>${s.dalys}</dd>
        <dt>Lacking basic services, 2050</dt><dd>${s.basic}</dd>
        <dt>High climate vulnerability, 2050</dt><dd>${s.vuln}</dd>
        <dt>Warming in 2100</dt><dd>${s.warm}</dd>
      </dl>`;
  };
  $$(".scn").forEach((b) => b.addEventListener("click", () => showScenario(+b.dataset.s)));
  showScenario(3);

  /* ---------- PATHWAYS ---------- */
  const pathways = [
    { ico: "🌬️", name: "Clean air & energy access", sub: "Pathways 1 + 6", c: "#6aa6ff", lives: 132, dalys: 3.79, ypd: 29,
      desc: "Replace coal and household smoke with clean grids, electric transit and clean cooking, and connect the 666M people without power. 36% of all lives saved." },
    { ico: "🏥", name: "Healthcare access", sub: "Pathway 4", c: "#38d6b0", lives: 98, dalys: 4.82, ypd: 49,
      desc: "Community health workers, maternal and newborn care, medical oxygen, vaccines and disease treatment. The largest source of healthy life-years." },
    { ico: "🌡️", name: "Climate resilience", sub: "Pathway 2", c: "#f2b84b", lives: 49, dalys: 0.67, ypd: 14,
      desc: "Cuts climate-linked mortality by 46%. 61% of the gain comes from adaptation (heat warnings, urban cooling, flood defences, drought-tolerant crops) and 39% from cutting emissions." },
    { ico: "🛡️", name: "Pandemic & conflict preparedness", sub: "Pathway 7", c: "#a78bfa", lives: 42, dalys: 0.96, ypd: 23,
      desc: "Surveillance, outbreak containment and shock-responsive safety nets. Halves the chance of a century pandemic killing over 50M (35% → 17%)." },
    { ico: "🥣", name: "Food & nutrition", sub: "Pathway 5", c: "#f2667a", lives: 26, dalys: 2.20, ypd: 84,
      desc: "First-1,000-days nutrition, climate-smart seeds and cold chains. Saves the youngest lives: 84 healthy years per death averted." },
    { ico: "🚰", name: "Water & sanitation", sub: "Pathway 3", c: "#4fd1ea", lives: 22, dalys: 1.17, ypd: 53,
      desc: "Piped chlorinated water and sealed sanitation cut the remaining century toll from unsafe water by 43%." },
  ];
  const fmt = { lives: (v) => v + "M", dalys: (v) => v.toFixed(2) + "B", ypd: (v) => v + " yrs" };
  const pb = $("#pathwayBars"), pcards = $("#pathwayCards");
  pathways.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "pbar"; row.style.setProperty("--c", p.c); row.dataset.i = i;
    row.innerHTML = `<div class="pbar__name"><i>${p.ico}</i>${p.name}</div><div class="pbar__track"><div class="pbar__fill"></div></div><div class="pbar__val"></div>`;
    pb.append(row);
    const card = document.createElement("article");
    card.className = "pcard"; card.style.setProperty("--c", p.c); card.dataset.i = i;
    card.innerHTML = `<span class="ico">${p.ico}</span><h3>${p.name}</h3><p class="muted" style="font-family:var(--mono);font-size:.72rem;margin-bottom:8px">${p.sub.toUpperCase()}</p><p>${p.desc}</p>
      <div class="nums"><div><b>${p.lives}M</b>lives</div><div><b>${p.dalys}B</b>healthy yrs</div><div><b>${p.ypd}</b>yrs / death</div></div>`;
    pcards.append(card);
    const hl = (on) => { row.classList.toggle("is-active", on); card.classList.toggle("is-active", on); };
    [row, card].forEach((el) => { el.addEventListener("mouseenter", () => hl(true)); el.addEventListener("mouseleave", () => hl(false)); });
  });
  let metric = "lives";
  const renderPathways = () => {
    const max = Math.max(...pathways.map((p) => p[metric]));
    $$(".pbar", pb).forEach((row, i) => {
      const p = pathways[i];
      row.querySelector(".pbar__fill").style.width = (p[metric] / max) * 100 + "%";
      row.querySelector(".pbar__val").textContent = fmt[metric](p[metric]);
    });
  };
  $$(".mt").forEach((b) => b.addEventListener("click", () => {
    metric = b.dataset.m;
    $$(".mt").forEach((x) => x.classList.toggle("is-active", x === b));
    renderPathways();
  }));
  $$(".pbar__val", pb).forEach((v, i) => (v.textContent = fmt.lives(pathways[i].lives)));
  onVisible(pb, renderPathways);

  /* ---------- REGIONS ---------- */
  const regions = [
    { name: "Sub-Saharan Africa", lives: 118, per: 91, c: "#f2b84b" },
    { name: "South Asia", lives: 111, per: 54, c: "#f2b84b" },
    { name: "East/SE Asia & Pacific", lives: 60, per: 25, c: "#38d6b0" },
    { name: "High-income West & other", lives: 31, per: 28, c: "#6b7590" },
    { name: "Middle East, N. Africa & C. Asia", lives: 23, per: 34, c: "#38d6b0" },
    { name: "Latin America & Caribbean", lives: 14, per: 21, c: "#38d6b0" },
  ];
  const rb = $("#regionBars");
  let rMetric = "lives";
  regions.forEach((r) => {
    const row = document.createElement("div");
    row.className = "rbar"; row.style.setProperty("--c", r.c);
    row.innerHTML = `<div class="rbar__name">${r.name}</div><div class="rbar__track"><div class="rbar__fill"></div></div><div class="rbar__val"></div>`;
    rb.append(row);
  });
  const renderRegions = () => {
    const max = Math.max(...regions.map((r) => r[rMetric]));
    $$(".rbar", rb).forEach((row, i) => {
      const r = regions[i];
      row.querySelector(".rbar__fill").style.width = (r[rMetric] / max) * 100 + "%";
      row.querySelector(".rbar__val").textContent = rMetric === "lives" ? r.lives + "M" : r.per + "/1k";
    });
  };
  $$(".rt").forEach((b) => b.addEventListener("click", () => {
    rMetric = b.dataset.r;
    $$(".rt").forEach((x) => x.classList.toggle("is-active", x === b));
    renderRegions();
  }));
  const rnote = document.createElement("p");
  rnote.className = "note";
  rnote.textContent = "Regions sum to 357M; a further 11M from transboundary aviation, shipping and global-spillover benefits brings the total to 368M.";
  rb.after(rnote);
  onVisible(rb, renderRegions);

  /* ---------- COST COMPARISON ---------- */
  const compare = [
    { name: "Global economic output (GDP)", v: 115, c: "#6b7590" },
    { name: "Fossil-fuel subsidies (IMF, incl. implicit)", v: 7, c: "#f2667a" },
    { name: "Global military spending (~2.3% GDP)", v: 2.6, c: "#a78bfa" },
    { name: "Coordinated resilience package (peak)", v: 1.2, c: "#38d6b0" },
  ];
  const cb = $("#compareBars");
  compare.forEach((r) => {
    const row = document.createElement("div");
    row.className = "cbar"; row.style.setProperty("--c", r.c);
    row.innerHTML = `<div class="cbar__name">${r.name}</div><div class="cbar__track"><div class="cbar__fill"></div></div><div class="cbar__val">$${r.v}T</div>`;
    cb.append(row);
  });
  const scaleToggle = document.createElement("label");
  scaleToggle.className = "note";
  scaleToggle.style.display = "flex"; scaleToggle.style.gap = "8px"; scaleToggle.style.alignItems = "center"; scaleToggle.style.cursor = "pointer";
  scaleToggle.innerHTML = `<input type="checkbox" id="hideGdp"> Zoom in (hide GDP bar)`;
  cb.after(scaleToggle);
  const renderCompare = () => {
    const hide = $("#hideGdp").checked;
    const rows = $$(".cbar", cb);
    const max = hide ? 7 : 115;
    rows.forEach((row, i) => {
      row.style.display = hide && i === 0 ? "none" : "";
      row.querySelector(".cbar__fill").style.width = Math.max(0.6, (compare[i].v / max) * 100) + "%";
    });
  };
  $("#hideGdp").addEventListener("change", renderCompare);
  onVisible(cb, renderCompare);

  /* ---------- DELAY ---------- */
  const PER_SEC = 8.3e6 / (365.25 * 86400);
  const dc = $("#delayCount");
  const t0 = Date.now();
  const tick = () => {
    dc.textContent = Math.floor(((Date.now() - t0) / 1000) * PER_SEC).toLocaleString();
    setTimeout(tick, 250);
  };
  tick();
  const slider = $("#startYear");
  const updateDelay = () => {
    const y = +slider.value;
    const lives = 368 - (y - 2026) * (143 / 14);
    $("#yearOut").textContent = y;
    $("#livesOut").textContent = Math.round(lives) + "M";
    $("#lostOut").textContent = y === 2026 ? "0" : Math.round(368 - lives) + "M";
  };
  slider.addEventListener("input", updateDelay);
  updateDelay();

  /* ---------- STRESS TESTS ---------- */
  const stress = [
    { name: "Combined adverse: 60% delivery + 8-yr delay", v: 211 },
    { name: "Partial delivery only (60%)", v: 236 },
    { name: "Doubled systemic overlap", v: 305 },
    { name: "Stalled global income growth", v: 307 },
    { name: "Central coordinated benchmark", v: 368, base: true },
    { name: "Aid cuts persist to 2040", v: 370 },
    { name: "Pandemic super-cycle (2.2×)", v: 390 },
    { name: "Hot-tail climate (+3.4°C drift)", v: 392 },
    { name: "Superbug surge (AMR crisis)", v: 399 },
  ];
  const sb = $("#stressBars");
  const SMAX = 420;
  stress.forEach((s) => {
    const row = document.createElement("div");
    row.className = "sbar";
    row.style.setProperty("--c", s.base ? "#ffffff" : s.v < 368 ? "#f2667a" : "#38d6b0");
    row.innerHTML = `<div class="sbar__name">${s.base ? "<b>" + s.name + "</b>" : s.name}</div><div class="sbar__track" style="--base:${(368 / SMAX) * 100}%"><div class="sbar__fill"></div></div><div class="sbar__val">${s.v}M</div>`;
    sb.append(row);
  });
  onVisible(sb, () => $$(".sbar", sb).forEach((row, i) => {
    setTimeout(() => (row.querySelector(".sbar__fill").style.width = (stress[i].v / SMAX) * 100 + "%"), i * 60);
  }));

  /* ---------- CITATION ---------- */
  $("#copyCite").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText($("#citeText").textContent);
      btn.textContent = "Copied ✓";
    } catch {
      const r = document.createRange(); r.selectNodeContents($("#citeText"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      btn.textContent = "Selected, press ⌘/Ctrl+C";
    }
    setTimeout(() => (btn.textContent = "Copy citation"), 2200);
  });
})();
