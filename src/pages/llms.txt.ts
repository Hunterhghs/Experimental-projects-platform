import { SITE, TYPES } from '../site.config.mjs';
import { getProjects, projectUrl, absUrl, type ProjectType } from '../lib/projects';

export async function GET() {
  const all = await getProjects();
  const sections = (Object.keys(TYPES) as ProjectType[])
    .map((t) => {
      const items = all.filter((p) => p.data.type === t);
      if (!items.length) return '';
      return `## ${TYPES[t].plural}\n\n${items.map((p) => `- [${p.data.title}](${absUrl(projectUrl(p))}): ${p.data.description}`).join('\n')}\n`;
    })
    .filter(Boolean)
    .join('\n');
  const text = `# ${SITE.name}\n\n> ${SITE.description}\n\nPublisher: ${SITE.publisher} (${SITE.publisherUrl}). Licence: ${SITE.license}. Full catalog: ${absUrl('/catalog.json')}\n\n${sections}`;
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
