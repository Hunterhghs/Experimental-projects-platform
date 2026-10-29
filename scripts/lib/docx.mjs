// Parse an H Heuristics monograph .docx into structured blocks + metadata.
// Image src attributes use the placeholder __PUBDIR__ (replaced once the slug is known).
import mammoth from 'mammoth';
import { parse } from 'node-html-parser';
import { text, esc, slugify } from './util.mjs';

const sharp = await import('sharp').then((m) => m.default).catch(() => null);

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

export async function parseDocx(docxPath) {
  // ---------- convert ----------
  const figures = [];
  const { value: html } = await mammoth.convertToHtml(
    { path: docxPath },
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
  const chapterPages = new Map();
  if (isBoldPara(nodes[i]) && /outline|structure|contents/i.test(text(nodes[i]))) {
    i++;
    if (isItalicPara(nodes[i])) i++;
    if (tag(nodes[i]) === 'table') {
      for (const tr of nodes[i].querySelectorAll('tbody tr')) {
        const cells = tr.querySelectorAll('td').map(text);
        const theme = cells.find((c, ix) => ix >= 2 && !/^pages?\s/i.test(c));
        const ch = cells[0]?.match(/(\d+)/);
        const pg = cells.find((c) => /^pages?\s+\d+/i.test(c))?.match(/(\d+)/);
        if (ch && pg) chapterPages.set(ch[1].padStart(2, '0'), Number(pg[1]));
        if (theme) themes.push(...theme.split(/,|&|·/).map((s) => s.trim()).filter((s) => s.length > 2));
      }
      i++;
    }
  }

  if (!meta.title) throw new Error('Could not find a title (expected a bold paragraph near the start of the document).');

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
      chapters.push({ id, number, title: ch[2], page: chapterPages.get(number) });
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
      f.caption = caption;
      const dims = f.w ? { w: f.w, h: f.h } : f.ext === 'jpg' ? jpegSize(f.buf) : null;
      const alt = caption || label;
      out.push(
        `<figure class="exhibit" id="exhibit-${figCount}">\n<div class="exhibit__frame"><img src="__PUBDIR__/${file}" alt="${esc(alt)}" loading="lazy" decoding="async"${dims ? ` width="${dims.w}" height="${dims.h}"` : ''}></div>\n` +
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

  return { meta, themes, out, chapters, highlights, paragraphs, figures, figCount, tableCount, refCount };
}

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
