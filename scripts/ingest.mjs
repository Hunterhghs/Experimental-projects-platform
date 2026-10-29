#!/usr/bin/env node
// Publish an H Heuristics report.
//
//   npm run ingest -- Report.pdf                 PDF edition (default): landing page + embedded PDF
//   npm run ingest -- Report.docx                same, using the .docx for richer metadata
//   npm run ingest -- Report.docx --digital      digital edition: full web-native report
//
// A same-named .pdf/.docx next to the input is picked up automatically.
// Options: --pdf file.pdf  --slug s  --date YYYY-MM-DD  --number YYYY-NNN  --topics a,b
//          --featured  --draft  --force (re-ingest an existing slug, keeping its number)
//
// The generated front matter (description, abstract, topics) is a first draft;
// review it before publishing.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { TOPICS, TOPIC_IDS } from '../src/data/topics.mjs';
import { slugify, yamlStr, truncate } from './lib/util.mjs';
import { parseDocx } from './lib/docx.mjs';
import { parsePdf, pdfPageCount, pdfPages, findPage } from './lib/pdf.mjs';

const sharp = await import('sharp').then((m) => m.default).catch(() => null);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    pdf: { type: 'string' },
    digital: { type: 'boolean', default: false },
    slug: { type: 'string' },
    date: { type: 'string' },
    number: { type: 'string' },
    topics: { type: 'string' },
    featured: { type: 'boolean', default: false },
    draft: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
  },
});

const input = positionals[0];
if (!input || !/\.(docx|pdf)$/i.test(input) || !fs.existsSync(input)) {
  console.error('Usage: npm run ingest -- path/to/Report.(pdf|docx) [--digital] [--pdf file.pdf] [--slug s] [--date YYYY-MM-DD] [--topics a,b]');
  process.exit(1);
}
const base = input.replace(/\.(docx|pdf)$/i, '');
const docxPath = input.toLowerCase().endsWith('.docx') ? input : fs.existsSync(`${base}.docx`) ? `${base}.docx` : null;
const pdfPath = opt.pdf ?? (input.toLowerCase().endsWith('.pdf') ? input : fs.existsSync(`${base}.pdf`) ? `${base}.pdf` : null);
const format = opt.digital ? 'digital' : 'pdf';
if (format === 'pdf' && !pdfPath) { console.error('PDF edition needs a PDF (pass --pdf, or use --digital for a web-only report).'); process.exit(1); }
if (format === 'digital' && !docxPath) { console.error('Digital edition needs the .docx source.'); process.exit(1); }

// ---------- parse ----------
const doc = docxPath ? await parseDocx(docxPath) : parsePdf(pdfPath);
const { meta, themes, chapters, highlights, paragraphs, figures } = doc;
if (!meta.title) { console.error('Could not find the report title.'); process.exit(1); }

let pages;
if (pdfPath) {
  pages = pdfPageCount(pdfPath);
  // Fill in PDF page numbers the source didn't state (e.g. the references section).
  if (chapters.some((c) => !c.page)) {
    const text = pdfPages(pdfPath);
    let from = 1;
    for (const c of chapters) {
      c.page ??= c.id === 'references'
        ? findPage(text, /references|bibliography|reading list|scholarly apparatus/i, from)
        : findPage(text, new RegExp(c.title.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), 'i'), from);
      if (c.page) from = c.page;
    }
  }
}

const slug = opt.slug || slugify(meta.title);
const pubDir = `/reports/${slug}`;
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
  // Score topics by keyword hits per 10k words; title matches weigh most.
  topics = TOPICS.map((tp) => ({
    id: tp.id,
    score: ((allText.match(tp.match) || []).length / words) * 10000
      + (meta.title.match(tp.match) || []).length * 60
      + ((meta.subtitle ?? '').match(tp.match) || []).length * 20,
  }))
    .filter((x) => x.score >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.id);
  if (!topics.length) topics = ['systemic-risk'];
}
const keywords = [...new Set(themes.map((s) => s.replace(/\s+/g, ' ')))].slice(0, 30);

// Number: next free YYYY-NNN across all projects (kept when re-ingesting with --force).
const contentRoot = path.join(ROOT, 'src/content/projects');
const existing = fs.globSync('**/*.md', { cwd: contentRoot });
const existingFile = existing.find((f) => path.basename(f, '.md') === slug);
if (existingFile && !opt.force) {
  console.error(`A project with slug "${slug}" already exists (${existingFile}). Use --force to overwrite or --slug for a new one.`);
  process.exit(1);
}
let number = opt.number;
if (!number && existingFile) number = fs.readFileSync(path.join(contentRoot, existingFile), 'utf8').match(/^number:\s*"?([\d-]+)"?/m)?.[1];
if (!number) {
  const nums = existing
    .map((f) => fs.readFileSync(path.join(contentRoot, f), 'utf8').match(/^number:\s*"?(\d{4})-(\d+)"?/m))
    .filter((m) => m && m[1] === year)
    .map((m) => Number(m[2]));
  number = `${year}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;
}

const description = truncate(paragraphs[0] ?? meta.subtitle ?? meta.title, 300);
const abstract = truncate(paragraphs.slice(0, 2).join(' '), 900);

// ---------- assets ----------
const assetDir = path.join(ROOT, 'public', pubDir);
fs.rmSync(assetDir, { recursive: true, force: true });
fs.mkdirSync(assetDir, { recursive: true });

let cover, coverAlt;
const usedFigures = format === 'digital' ? figures.filter((f) => f.file) : figures.filter((f) => f.file).slice(0, 1);
for (const f of usedFigures) fs.writeFileSync(path.join(assetDir, f.file), f.buf);
if (usedFigures[0]) {
  cover = `${pubDir}/${usedFigures[0].file}`;
  coverAlt = usedFigures[0].caption || meta.title;
} else if (pdfPath && sharp) {
  // No figures: use a render of the PDF's first page as the social/cover image.
  const png = execFileSync('pdftoppm', ['-png', '-f', '1', '-l', '1', '-scale-to', '1200', '-singlefile', pdfPath, '-']);
  await sharp(png).webp({ quality: 82 }).toFile(path.join(assetDir, 'cover.webp'));
  cover = `${pubDir}/cover.webp`;
  coverAlt = `Cover page of ${meta.title}`;
}

let pdfRel;
if (pdfPath) {
  pdfRel = `${pubDir}/${slug}.pdf`;
  fs.copyFileSync(pdfPath, path.join(ROOT, 'public', pdfRel));
}

// ---------- write ----------
const author = meta['lead author'] ?? meta.author;
const authorName = author ? author.split(',')[0].trim() : 'Hunter Hughes';
const authorRole = author && author.includes(',') ? author.split(',').slice(1).join(',').trim() : undefined;

const fm = [
  '---',
  `type: report`,
  `format: ${format}`,
  `number: "${number}"`,
  `title: ${yamlStr(meta.title)}`,
  meta.subtitle && `subtitle: ${yamlStr(meta.subtitle)}`,
  meta.series && `series: ${yamlStr(meta.series)}`,
  `description: ${yamlStr(description)}`,
  `abstract: ${yamlStr(abstract)}`,
  `topics: [${topics.map(yamlStr).join(', ')}]`,
  `keywords: [${keywords.map(yamlStr).join(', ')}]`,
  `authors:`,
  `  - name: ${yamlStr(authorName)}`,
  authorRole && `    role: ${yamlStr(authorRole)}`,
  `date: ${date}`,
  cover && `cover: ${yamlStr(cover)}`,
  cover && `coverAlt: ${yamlStr(coverAlt)}`,
  pdfRel && `pdf: ${yamlStr(pdfRel)}`,
  pages && `pages: ${pages}`,
  `chapters:`,
  ...chapters.map((c) => `  - { id: ${yamlStr(c.id)}, ${c.number ? `number: ${yamlStr(c.number)}, ` : ''}title: ${yamlStr(c.title)}${c.page ? `, page: ${c.page}` : ''} }`),
  `highlights:`,
  ...highlights.map((h) => `  - ${yamlStr(h)}`),
  `stats: { words: ${words}, readingMinutes: ${Math.max(1, Math.round(words / 230))}, figures: ${doc.figCount}, tables: ${doc.tableCount}, references: ${doc.refCount} }`,
  opt.featured && 'featured: true',
  opt.draft && 'draft: true',
  '---',
].filter(Boolean).join('\n');

// Digital edition: each block is one HTML element separated by a blank line, so Markdown passes it through untouched.
const body = format === 'digital'
  ? doc.out.map((b) => b.replace(/\n{2,}/g, '\n').replaceAll('__PUBDIR__', pubDir)).join('\n\n')
  : '';
const mdDir = path.join(contentRoot, 'reports', year);
fs.mkdirSync(mdDir, { recursive: true });
const mdPath = path.join(mdDir, `${slug}.md`);
if (existingFile && path.join(contentRoot, existingFile) !== mdPath) fs.rmSync(path.join(contentRoot, existingFile));
fs.writeFileSync(mdPath, `${fm}\n${body ? `\n${body}\n` : ''}`);

console.log(`✓ ${meta.title}
  edition   ${format === 'pdf' ? 'PDF' : 'digital'}${docxPath ? ' (metadata from .docx)' : ' (metadata from PDF)'}
  number    ${number}
  slug      ${slug}
  file      ${path.relative(ROOT, mdPath)}
  assets    public${pubDir}/ (${usedFigures.length} figure${usedFigures.length === 1 ? '' : 's'}${pdfRel ? `, PDF ${pages ?? '?'} pp` : ''})
  chapters  ${chapters.length}  exhibits ${doc.figCount}  tables ${doc.tableCount}  references ${doc.refCount}  words ${words}
  topics    ${topics.join(', ')}
  url       /reports/${slug}/`);
