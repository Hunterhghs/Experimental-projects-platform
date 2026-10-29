// Extract metadata from a PDF when no .docx is available, using poppler
// (pdfinfo / pdftotext, installed locally: `brew install poppler`).
// Headings are found by line height, so it works for any report whose
// headings are set larger than body text.
import { execFileSync } from 'node:child_process';
import { parse } from 'node-html-parser';

const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export function pdfPageCount(pdfPath) {
  const m = run('pdfinfo', [pdfPath]).match(/^Pages:\s+(\d+)/m);
  return m ? Number(m[1]) : undefined;
}

/** Plain text of each page (index 0 = page 1). */
export function pdfPages(pdfPath) {
  return run('pdftotext', ['-layout', pdfPath, '-']).split('\f');
}

/** Find the page on which a heading appears, searching from `from` (1-based). */
export function findPage(pages, pattern, from = 1) {
  for (let i = from - 1; i < pages.length; i++) if (pattern.test(pages[i])) return i + 1;
  return undefined;
}

export function parsePdf(pdfPath) {
  const doc = parse(run('pdftotext', ['-bbox-layout', pdfPath, '-']));
  const lines = [];
  doc.querySelectorAll('page').forEach((pg, pi) => {
    pg.querySelectorAll('line').forEach((ln) => {
      const t = decode(ln.querySelectorAll('word').map((w) => w.textContent).join(' ')).trim();
      if (!t) return;
      const y0 = parseFloat(ln.getAttribute('yMin')), y1 = parseFloat(ln.getAttribute('yMax'));
      lines.push({ page: pi + 1, y: y0, h: Math.round((y1 - y0) * 10) / 10, t });
    });
  });

  // Body text height = most common line height.
  const freq = new Map();
  for (const l of lines) freq.set(l.h, (freq.get(l.h) ?? 0) + l.t.length);
  const bodyH = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];

  // Merge consecutive lines of the same (larger-than-body) height into heading blocks.
  const blocks = [];
  for (const l of lines) {
    const prev = blocks.at(-1);
    if (prev && prev.page === l.page && Math.abs(prev.h - l.h) < 0.6 && l.y - prev.lastY < l.h * 1.8) {
      prev.t += ' ' + l.t; prev.lastY = l.y;
    } else blocks.push({ ...l, lastY: l.y });
  }
  const isHeading = (b) => b.h > bodyH * 1.25;

  // Cover page: tallest block = title, next large block = subtitle.
  const cover = blocks.filter((b) => b.page === 1);
  const maxH = Math.max(...cover.map((b) => b.h));
  const titleIdx = cover.findIndex((b) => b.h === maxH);
  const meta = { title: cover[titleIdx]?.t };
  const sub = cover.slice(titleIdx + 1).find((b) => b.h > bodyH * 1.05 && !/:\s*$/.test(b.t) && !/^[A-Z ]+:/.test(b.t));
  if (sub) meta.subtitle = sub.t;
  const series = cover.find((b) => /H HEURISTICS/i.test(b.t));
  if (series) meta.series = series.t.replace(/^H HEURISTICS\s*[·|:-]\s*/i, '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  const coverText = cover.map((b) => b.t).join('\n');
  // Cover labels can merge into one block, so stop each value at the next "LABEL:".
  const field = (re) => coverText.match(re)?.[1]?.split(/\s+[A-Z][A-Z ]{3,}:/)[0].trim();
  meta['lead author'] = field(/(?:LEAD )?AUTHOR:\s*(.+)/i);
  meta['publication date'] = field(/PUBLICATION DATE:\s*(.+)/i);

  // Chapters: heading blocks that start with "Chapter NN".
  const chapters = [];
  for (const b of blocks) {
    if (!isHeading(b)) continue;
    const m = b.t.match(/^Chapter\s+(\d+)\s*[:.–—-]\s*(.+)$/i);
    if (m) {
      const number = m[1].padStart(2, '0');
      if (!chapters.some((c) => c.number === number)) chapters.push({ id: `chapter-${number}`, number, title: m[2], page: b.page });
    } else if (/^(references|bibliography|works cited)\b|reading list|scholarly apparatus/i.test(b.t) && !chapters.some((c) => c.id === 'references')) {
      chapters.push({ id: 'references', title: 'References', page: b.page });
    }
  }

  // Body paragraphs: lines at body height, after the first chapter heading.
  const firstCh = chapters[0];
  const body = lines.filter((l) => l.h === bodyH && (!firstCh || l.page >= firstCh.page));
  const paragraphs = [];
  let cur = '', lastY = -1, lastPage = 0;
  for (const l of body) {
    if (cur && (l.page !== lastPage || l.y - lastY > l.h * 1.9)) { paragraphs.push(cur); cur = ''; }
    cur = cur ? `${cur} ${l.t}` : l.t;
    lastY = l.y; lastPage = l.page;
  }
  if (cur) paragraphs.push(cur);
  const prose = paragraphs.filter((p) => p.length > 200 && !/^\[\d+\]/.test(p) && !/\bPage \d+ of \d+\b/.test(p));

  const full = lines.map((l) => l.t).join('\n');
  const highlights = [...full.matchAll(/(?:▪\s*)?Strategic Insight:\s*([\s\S]*?)(?=\n(?:[A-Z][A-Z &]{8,}|Chapter\s+\d+|H HEURISTICS)|\n\n|$)/g)]
    .map((m) => m[1].replace(/\s+/g, ' ').trim()).filter((s) => s.length > 40);
  const refCount = new Set([...full.matchAll(/^\[(\d+)\]/gm)].map((m) => m[1])).size;
  const figCount = new Set([...full.matchAll(/^Exhibit\s+(\d+)\s*:/gm)].map((m) => m[1])).size;
  const tableCount = new Set([...full.matchAll(/^Table\s+(\d+)\s*:/gm)].map((m) => m[1])).size;

  return { meta, themes: [], out: [], chapters, highlights, paragraphs: prose, figures: [], figCount, tableCount, refCount };
}
