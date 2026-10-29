import { absUrl } from '../lib/projects';
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: /search/\n\nSitemap: ${absUrl('/sitemap-index.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
