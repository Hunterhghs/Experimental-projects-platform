// Regenerates public/og-default.png (the social card used when a page has no cover).
import sharp from 'sharp';
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
<rect width="1200" height="630" fill="#1a1f2b"/>
<rect x="0" y="0" width="1200" height="6" fill="#c8a951"/>
<text x="80" y="140" font-family="Menlo, monospace" font-size="22" letter-spacing="5" fill="#c8a951">H HEURISTICS · NAVIGATING A CHANGING WORLD</text>
<text x="80" y="330" font-family="Georgia, serif" font-size="112" font-weight="600" fill="#f0ede6">Experimental</text>
<text x="80" y="450" font-family="Georgia, serif" font-size="112" font-weight="600" fill="#f0ede6">Projects</text>
<line x1="80" y1="500" x2="1120" y2="500" stroke="#f0ede6" stroke-opacity="0.25"/>
<text x="80" y="550" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#f0ede6" fill-opacity="0.75">Reports · Dashboards · Analytical projects</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(new URL('../public/og-default.png', import.meta.url).pathname.replace(/%20/g, ' '));
console.log('wrote public/og-default.png');
