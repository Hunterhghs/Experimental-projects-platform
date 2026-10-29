// Regenerates public/og-default.png (the social card used when a page has no cover).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const grid = Array.from({ length: 50 }, (_, i) => `<line x1="${i * 24}" y1="0" x2="${i * 24}" y2="630" stroke="#0d0f12" stroke-opacity="0.05"/>`).join('')
  + Array.from({ length: 27 }, (_, i) => `<line x1="0" y1="${i * 24}" x2="1200" y2="${i * 24}" stroke="#0d0f12" stroke-opacity="0.05"/>`).join('');
const bars = Array.from({ length: 96 }, (_, i) => {
  const h = 20 + Math.round(40 * (0.5 + 0.5 * Math.sin(i / 5) * Math.cos(i / 13)));
  return `<rect x="${80 + i * 10.85}" y="${600 - h}" width="6" height="${h}" fill="${i % 9 === 4 ? '#0d0f12' : '#d9441f'}"/>`;
}).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#f2f2ee"/>${grid}
<rect x="80" y="80" width="56" height="56" fill="#0d0f12"/><rect x="124" y="124" width="18" height="18" fill="#d9441f"/>
<text x="108" y="121" text-anchor="middle" font-family="Arial Black, Helvetica, sans-serif" font-size="34" font-weight="900" fill="#f2f2ee">H</text>
<text x="160" y="104" font-family="Helvetica, Arial, sans-serif" font-size="26" font-weight="700" fill="#0d0f12">H Heuristics</text>
<text x="160" y="132" font-family="Menlo, monospace" font-size="18" fill="#6a6f78">Projects Lab</text>
<text x="80" y="300" font-family="Arial Black, Helvetica, sans-serif" font-size="84" font-weight="900" fill="#0d0f12" letter-spacing="-3">Experimental research,</text>
<text x="80" y="392" font-family="Arial Black, Helvetica, sans-serif" font-size="84" font-weight="900" fill="#0d0f12" letter-spacing="-3">published <tspan fill="#d9441f">in the open.</tspan></text>
<text x="80" y="460" font-family="Menlo, monospace" font-size="20" fill="#353a42">Reports · Dashboards · Projects — projects.hheuristics.com</text>
${bars}<line x1="80" y1="600.5" x2="1120" y2="600.5" stroke="#0d0f12"/>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(fileURLToPath(new URL('../public/og-default.png', import.meta.url)));
console.log('wrote public/og-default.png');
