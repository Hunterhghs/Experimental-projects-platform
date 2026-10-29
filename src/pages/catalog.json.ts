import { SITE, TYPES } from '../site.config.mjs';
import { getProjects, projectUrl, projectNumber, absUrl, topicLabel, isoDate } from '../lib/projects';

// Machine-readable index of every project (for aggregators, scripts and AI agents).
export async function GET() {
  const all = await getProjects();
  const body = {
    name: SITE.name,
    url: SITE.url,
    publisher: SITE.publisher,
    generated: new Date().toISOString(),
    count: all.length,
    projects: all.map((p) => ({
      id: projectNumber(p),
      slug: p.id,
      type: TYPES[p.data.type].label,
      title: p.data.title,
      subtitle: p.data.subtitle,
      description: p.data.description,
      url: absUrl(projectUrl(p)),
      pdf: p.data.pdf ? absUrl(p.data.pdf) : undefined,
      authors: p.data.authors.map((a) => a.name),
      date: isoDate(p.data.date),
      topics: p.data.topics.map(topicLabel),
      keywords: p.data.keywords,
      status: p.data.status,
    })),
  };
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
