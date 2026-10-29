import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE, TYPES } from '../site.config.mjs';
import { getProjects, projectUrl, topicLabel } from '../lib/projects';

export async function GET(context: APIContext) {
  const all = await getProjects();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: all.slice(0, 100).map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: projectUrl(p),
      author: p.data.authors.map((a) => a.name).join(', '),
      categories: [TYPES[p.data.type].label, ...p.data.topics.map(topicLabel)],
    })),
    customData: `<language>${SITE.language}</language>`,
  });
}
