#!/usr/bin/env node
// Convert an H Heuristics monograph (.docx, optionally with its .pdf) into a
// web report: src/content/projects/reports/<year>/<slug>.md + public/reports/<slug>/*
//
//   npm run ingest -- path/to/Report.docx [--pdf path/to/Report.pdf] [--slug my-slug]
//        [--date 2026-10-29] [--topics air-quality,climate] [--featured] [--draft] [--force]
//
// The generated front matter (description, topics, keywords) is a strong first
// draft; review it before publishing.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import mammoth from 'mammoth';
import { parse } from 'node-html-parser';
import { TOPICS, TOPIC_IDS } from '../src/data/topics.mjs';

const sharp = await import('sharp').then((m) => m.default).catch(() => null);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    pdf: { type: 'string' },
    slug: { type: 'string' },
    date: { type: 'string' },
    number: { type: 'string' },
    topics: { type: 'string' },
    featured: { type: 'boolean', default: false },
    draft: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
  },
});

const src = positionals[0];
if (!src || !src.endsWith('.docx')) {
  console.error('Usage: npm run ingest -- path/to/Report.docx [--pdf file.pdf] [--slug s] [--date YYYY-MM-DD] [--topics a,b]');
  process.exit(1);
}

// ---------- helpers ----------
const text = (n) => n.textContent.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slugify = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const tag = (n) => (n.tagName || '').toLowerCase();
/** A paragraph whose entire text is bold, i.e. a heading/label in these documents. */
const isBoldPara = (n) => {
  if (tag(n) !== 'p') return false;
  const t = text(n);
  if (!t) return false;
  const bold = n.querySelectorAll('strong').map(text).join(' ').replace(/\s+/g, ' ').trim();
  return bold === t;
};
const isItalicPara = (n) => tag(n) === 'p' && text(n) && n.querySelectorAll('em').map(text).join(' ').trim() === text(n);
const unwrapCellParas = (html) => html.replace(/<\/p>\s*<p>/g, '<br>').replace(/<\/?p>/g, '');
const yamlStr = (s) => JSON.stringify(s ?? '');
const truncate = (s, max) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
  return stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '') + '…';
};

// ---------- convert ----------
const figures = [];
const { value: html } = await mammoth.convertToHtml(
  { path: src },
  {
    convertImage: mammoth.images.imgElement(async (img) => {
      let buf = await img.readAsBuffer();
      let ext = img.contentType.includes('png') ? 'png' : img.contentType.includes('svg') ? 'svg' : 'jpg';
      let w, h;
      if (sharp && ext !== 'svg') {
        // Re-encode as WebP: ~4x smaller than the PNGs Word embeds.
        const res = await sharp(buf).webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
        buf = res.data; ext = 'webp'; w = res.info.width; h = res.info.height;
      }
      figures.push({ buf, ext, w, h });
      return { src: `__FIG_${figures.length}__` };
    }),
  },
);

const nodes = parse(html).childNodes.filter((n) => tag(n));
let i = 0;
const meta = {};

// Cover block: series line, title, subtitle, metadata table.
if (isBoldPara(nodes[i]) && /H HEURISTICS/i.test(text(nodes[i]))) {
  meta.series = text(nodes[i]).replace(/^H HEURISTICS\s*[·|:-]\s*/i, '')
    .toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  i++;
}
if (isBoldPara(nodes[i])) meta.title = text(nodes[i++]);
if (isItalicPara(nodes[i])) meta.subtitle = text(nodes[i++]);
if (tag(nodes[i]) === 'table' && /AUTHOR|PUBLICATION/i.test(text(nodes[i]))) {
  for (const tr of nodes[i].querySelectorAll('tr')) {
    const [k, v] = tr.querySelectorAll('td').map(text);
    if (k && v) meta[k.replace(/:$/, '').toLowerCase()] = v;
  }
  i++;
}

// Optional outline table ("Analytical Structure ..."): keep its theme column for keywords.
const themes = [];
if (isBoldPara(nodes[i]) && /outline|structure|contents/i.test(text(nodes[i]))) {
  i++;
  if (isItalicPara(nodes[i])) i++;
  if (tag(nodes[i]) === 'table') {
    for (const tr of nodes[i].querySelectorAll('tbody tr')) {
      const cells = tr.querySelectorAll('td').map(text);
      const theme = cells.find((c, ix) => ix >= 2 && !/^pages?\s/i.test(c));
      if (theme) themes.push(...theme.split(/,|&|·/).map((s) => s.trim()).filter((s) => s.length > 2));
    }
    i++;
  }
}

if (!meta.title) {
  console.error('Could not find a title (expected a bold paragraph near the start of the document).');
  process.exit(1);
}

const slug = opt.slug || slugify(meta.title);
const pubDir = `/reports/${slug}`;
const out = [];
const chapters = [];
const highlights = [];
const paragraphs = [];
const usedIds = new Set();
let figCount = 0, tableCount = 0, refCount = 0, inRefs = false, refList = null;

const uniqueId = (base) => {
  let id = base.slice(0, 64).replace(/-+$/, ''), n = 2;
  while (usedIds.has(id)) id = `${base.slice(0, 60)}-${n++}`;
  usedIds.add(id);
  return id;
};
const flushRefs = () => { if (refList) { out.push(`<ol class="references">\n${refList.join('\n')}\n</ol>`); refList = null; } };
const imgTag = (n) => {
  const m = n.toString().match(/__FIG_(\d+)__/);
  return m ? Number(m[1]) : null;
};

for (; i < nodes.length; i++) {
  const n = nodes[i];
  const t = text(n);
  const k = tag(n);
  if (!t && k === 'p' && imgTag(n) === null) continue;

  // Chapter heading
  const ch = isBoldPara(n) && t.match(/^Chapter\s+(\d+)\s*[:.–—-]\s*(.+)$/i);
  if (ch) {
    flushRefs(); inRefs = false;
    const number = ch[1].padStart(2, '0');
    const id = uniqueId(`chapter-${number}`);
    chapters.push({ id, number, title: ch[2] });
    out.push(`<h2 id="${id}"><span class="chapter-num">Chapter ${number}</span>${esc(ch[2])}</h2>`);
    continue;
  }

  // References / bibliography heading
  if (isBoldPara(n) && t.length < 180 && /^(references|bibliography|sources|works cited|notes)\b|reading list|scholarly apparatus/i.test(t)) {
    flushRefs();
    if (inRefs) { out.push(`<h3>${esc(t)}</h3>`); continue; } // "Part II" etc.
    inRefs = true;
    const id = uniqueId('references');
    chapters.push({ id, title: 'References' });
    out.push(`<h2 id="${id}">References</h2>`);
    if (!/^references$/i.test(t)) out.push(`<h3>${esc(t)}</h3>`);
    continue;
  }

  // Reference entries: "[12] Author ..."
  if (inRefs && k === 'p') {
    const m = t.match(/^\[(\d+)\]\s*/);
    if (m) {
      refCount++;
      refList ??= [];
      const body = n.innerHTML.replace(/^\s*<strong>\s*\[\d+\]\s*<\/strong>\s*/, '').replace(/^\s*\[\d+\]\s*/, '')
        .replace(/<a /g, '<a rel="noopener" ');
      refList.push(`<li id="ref-${m[1]}"><span class="ref-n">[${m[1]}]</span><span>${body}</span></li>`);
      continue;
    }
    flushRefs();
    out.push(`<p class="refs-note">${n.innerHTML}</p>`);
    continue;
  }

  // Figure: <p><img></p> + "Exhibit N: caption" + "Data Source: ..."
  const fig = k === 'p' ? imgTag(n) : null;
  if (fig !== null) {
    figCount++;
    let label = `Exhibit ${figCount}`, caption = '', source = '';
    const next = nodes[i + 1];
    if (next && isBoldPara(next) && /^(exhibit|figure|chart)\s+\d+/i.test(text(next))) {
      const m = text(next).match(/^((?:exhibit|figure|chart)\s+\d+)\s*[:.–—-]\s*(.*)$/i);
      label = m ? m[1] : label;
      caption = m ? m[2] : text(next);
      i++;
    }
    const after = nodes[i + 1];
    if (after && /^(data\s+)?sources?\s*:/i.test(text(after))) {
      source = after.innerHTML.replace(/<strong>[^<]*<\/strong>\s*/, '').trim();
      i++;
    }
    const f = figures[fig - 1];
    const file = `exhibit-${String(figCount).padStart(2, '0')}.${f.ext}`;
    f.file = file;
    const dims = f.w ? { w: f.w, h: f.h } : f.ext === 'jpg' ? jpegSize(f.buf) : null;
    const alt = caption || label;
    out.push(
      `<figure class="exhibit" id="exhibit-${figCount}">\n<div class="exhibit__frame"><img src="${pubDir}/${file}" alt="${esc(alt)}" loading="lazy" decoding="async"${dims ? ` width="${dims.w}" height="${dims.h}"` : ''}></div>\n` +
        `<figcaption><span class="exhibit__label">${esc(label)}</span><b>${esc(caption)}</b>${source ? `<span class="exhibit__source">Source: ${source}</span>` : ''}</figcaption>\n</figure>`,
    );
    continue;
  }

  // Table caption: "Table N: title" (+ italic note) followed by a table
  const tc = isBoldPara(n) && t.match(/^(Table\s+\d+)\s*[:.–—-]\s*(.*)$/i);
  if (tc) {
    let note = '';
    if (isItalicPara(nodes[i + 1])) note = text(nodes[++i]);
    if (tag(nodes[i + 1]) === 'table') {
      tableCount++;
      const tbl = nodes[++i];
      out.push(
        `<figure class="table" id="table-${tableCount}">\n<figcaption class="table__cap"><b>${esc(tc[1])}: ${esc(tc[2])}</b>${note ? `<span>${esc(note)}</span>` : ''}</figcaption>\n` +
          `<div class="table__scroll">${cleanTable(tbl)}</div>\n</figure>`,
      );
      continue;
    }
  }

  if (k === 'table') {
    const cells = n.querySelectorAll('td, th');
    // Single-cell callout box: "KEY TAKEAWAY & STRATEGIC INSIGHT"
    if (cells.length === 1) {
      const ps = cells[0].querySelectorAll('p');
      const first = ps[0] ? text(ps[0]) : '';
      const hasLabel = ps.length > 1 && isBoldPara(ps[0]);
      const body = (hasLabel ? ps.slice(1) : ps)
        .map((p) => `<p>${p.innerHTML.replace(/^(\s*<strong>)\s*[▪•■◆]\s*/, '$1').replace(/^\s*[▪•■◆]\s*/, '').trim()}</p>`)
        .join('\n');
      const label = hasLabel ? first.toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : 'Key takeaway';
      if (/takeaway|insight/i.test(label)) {
        highlights.push(text(parse(body)).replace(/^[^:]{0,40}:\s*/, ''));
      }
      out.push(`<aside class="takeaway"><span class="takeaway__label">${esc(label)}</span>\n${body}\n</aside>`);
      continue;
    }
    tableCount++;
    out.push(`<figure class="table"><div class="table__scroll">${cleanTable(n)}</div></figure>`);
    continue;
  }

  // Sub-heading
  if (isBoldPara(n) && t.length < 180) {
    out.push(`<h3 id="${uniqueId(slugify(t))}">${esc(t)}</h3>`);
    continue;
  }

  if (k === 'p') {
    paragraphs.push(t);
    out.push(`<p>${n.innerHTML.trim()}</p>`);
    continue;
  }

  // Lists, headings and anything else pass through untouched.
  out.push(n.toString());
}
flushRefs();

function cleanTable(tbl) {
  let h = tbl.toString()
    .replace(/<t([hd])([^>]*)>\s*([\s\S]*?)\s*<\/t\1>/g, (_, c, attrs, inner) => `<t${c}${attrs}>${unwrapCellParas(inner)}</t${c}>`)
    .replace(/<th([^>]*)><strong>([\s\S]*?)<\/strong><\/th>/g, '<th$1>$2</th>');
  if (!/<thead/.test(h)) {
    // Promote the first row to a header when the document didn't mark one.
    h = h.replace(/<table>\s*<tr>([\s\S]*?)<\/tr>/, (_, row) =>
      `<table><thead><tr>${row.replace(/<td/g, '<th').replace(/<\/td>/g, '</th>').replace(/<\/?strong>/g, '')}</tr></thead><tbody>`,
    ).replace(/<\/table>$/, '</tbody></table>');
  }
  return h;
}

function jpegSize(buf) {
  let o = 2;
  while (o < buf.length) {
    if (buf[o] !== 0xff) return null;
    const marker = buf[o + 1];
    const len = buf.readUInt16BE(o + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(o + 5), w: buf.readUInt16BE(o + 7) };
    }
    o += 2 + len;
  }
  return null;
}

// ---------- metadata ----------
const allText = [meta.title, meta.subtitle, ...paragraphs].join(' ');
const words = allText.split(/\s+/).length;

let date = opt.date;
if (!date) {
  const pub = meta['publication date'] ? new Date(`1 ${meta['publication date']} UTC`) : null;
  const today = new Date();
  date = pub && !isNaN(pub) && !(pub.getUTCFullYear() === today.getFullYear() && pub.getUTCMonth() === today.getMonth())
    ? pub.toISOString().slice(0, 10)
    : today.toISOString().slice(0, 10);
}
const year = date.slice(0, 4);

let topics;
if (opt.topics) {
  topics = opt.topics.split(',').map((s) => s.trim());
  const bad = topics.filter((t) => !TOPIC_IDS.includes(t));
  if (bad.length) { console.error(`Unknown topic(s): ${bad.join(', ')}. Valid: ${TOPIC_IDS.join(', ')}`); process.exit(1); }
} else {
  // Score topics by keyword hits per 10k words; title matches weigh heavily.
  const titleText = `${meta.title} ${meta.subtitle ?? ''}`;
  topics = TOPICS.map((tp) => ({
    id: tp.id,
    score: ((allText.match(tp.match) || []).length / words) * 10000 + (titleText.match(tp.match) || []).length * 40,
  }))
    .filter((x) => x.score >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.id);
  if (!topics.length) topics = ['systemic-risk'];
}

const keywords = [...new Set(themes.map((s) => s.replace(/\s+/g, ' ')))].slice(0, 30);

// Number: next free YYYY-NNN across all projects.
const contentRoot = path.join(ROOT, 'src/content/projects');
const existing = fs.globSync ? fs.globSync('**/*.md', { cwd: contentRoot }) : [];
let number = opt.number;
const existingFile = existing.find((f) => path.basename(f, '.md') === slug);
if (existingFile && !opt.force) {
  console.error(`A project with slug "${slug}" already exists (${existingFile}). Use --force to overwrite or --slug for a new one.`);
  process.exit(1);
}
if (!number && existingFile) {
  number = fs.readFileSync(path.join(contentRoot, existingFile), 'utf8').match(/^number:\s*"?([\d-]+)"?/m)?.[1];
}
if (!number) {
  const nums = existing
    .map((f) => fs.readFileSync(path.join(contentRoot, f), 'utf8').match(/^number:\s*"?(\d{4})-(\d+)"?/m))
    .filter((m) => m && m[1] === year)
    .map((m) => Number(m[2]));
  number = `${year}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
}

const intro = paragraphs[0] ?? meta.subtitle ?? meta.title;
const description = truncate(intro, 300);
const abstract = truncate(paragraphs.slice(0, 2).join(' '), 900);

// ---------- write ----------
const assetDir = path.join(ROOT, 'public', pubDir);
fs.mkdirSync(assetDir, { recursive: true });
for (const f of figures) if (f.file) fs.writeFileSync(path.join(assetDir, f.file), f.buf);

let pdfRel, pages;
const pdfSrc = opt.pdf ?? src.replace(/\.docx$/, '.pdf');
if (fs.existsSync(pdfSrc)) {
  const pdfName = `${slug}.pdf`;
  fs.copyFileSync(pdfSrc, path.join(assetDir, pdfName));
  pdfRel = `${pubDir}/${pdfName}`;
  const pdfText = fs.readFileSync(pdfSrc, 'latin1');
  const m = pdfText.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/);
  pages = m ? Number(m[1]) : undefined;
}

const author = meta['lead author'] ?? meta.author;
const authorName = author ? author.split(',')[0].trim() : 'Hunter Hughes';
const authorRole = author && author.includes(',') ? author.split(',').slice(1).join(',').trim() : undefined;

const fm = [
  '---',
  `type: report`,
  `number: "${number}"`,
  `title: ${yamlStr(meta.title)}`,
  meta.subtitle && `subtitle: ${yamlStr(meta.subtitle)}`,
  meta.series && `series: ${yamlStr(meta.series)}`,
  `description: ${yamlStr(description)}`,
  `abstract: ${yamlStr(abstract)}`,
  `topics: [${topics.map((t) => yamlStr(t)).join(', ')}]`,
  `keywords: [${keywords.map(yamlStr).join(', ')}]`,
  `authors:`,
  `  - name: ${yamlStr(authorName)}`,
  authorRole && `    role: ${yamlStr(authorRole)}`,
  `date: ${date}`,
  figures[0]?.file && `cover: ${yamlStr(`${pubDir}/${figures[0].file}`)}`,
  figures[0]?.file && chapters.length && `coverAlt: ${yamlStr(out.find((h) => h.includes('exhibit-1'))?.match(/alt="([^"]*)"/)?.[1] ?? meta.title)}`,
  pdfRel && `pdf: ${yamlStr(pdfRel)}`,
  pages && `pages: ${pages}`,
  `chapters:`,
  ...chapters.map((c) => `  - { id: ${yamlStr(c.id)}, ${c.number ? `number: ${yamlStr(c.number)}, ` : ''}title: ${yamlStr(c.title)} }`),
  `highlights:`,
  ...highlights.map((h) => `  - ${yamlStr(h)}`),
  `stats: { words: ${words}, readingMinutes: ${Math.max(1, Math.round(words / 230))}, figures: ${figCount}, tables: ${tableCount}, references: ${refCount} }`,
  opt.featured && 'featured: true',
  opt.draft && 'draft: true',
  '---',
].filter(Boolean).join('\n');

// Each block is one HTML element separated by a blank line, so Markdown passes it through untouched.
const body = out.map((b) => b.replace(/\n{2,}/g, '\n')).join('\n\n');
const mdDir = path.join(contentRoot, 'reports', year);
fs.mkdirSync(mdDir, { recursive: true });
if (existingFile && path.join(contentRoot, existingFile) !== path.join(mdDir, `${slug}.md`)) fs.rmSync(path.join(contentRoot, existingFile));
const mdPath = path.join(mdDir, `${slug}.md`);
fs.writeFileSync(mdPath, `${fm}\n\n${body}\n`);

console.log(`✓ ${meta.title}
  number    ${number}
  slug      ${slug}
  file      ${path.relative(ROOT, mdPath)}
  assets    public${pubDir}/ (${figures.filter((f) => f.file).length} figures${pdfRel ? ', PDF' : ''})
  chapters  ${chapters.length}  tables ${tableCount}  references ${refCount}  words ${words}
  topics    ${topics.join(', ')}
  url       /reports/${slug}/`);
