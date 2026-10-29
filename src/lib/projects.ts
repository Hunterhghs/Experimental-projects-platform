import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE, TYPES } from '../site.config.mjs';
import { topicById } from '../data/topics.mjs';

export type Project = CollectionEntry<'projects'>;
export type ProjectType = keyof typeof TYPES;

export async function getProjects(type?: ProjectType): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => !data.draft && (!type || data.type === type));
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || b.data.number.localeCompare(a.data.number));
}

export const sectionOf = (type: ProjectType) => TYPES[type].section;
export const typeOfSection = (section: string) =>
  (Object.keys(TYPES) as ProjectType[]).find((t) => TYPES[t].section === section);

export const projectUrl = (p: Project) => `/${sectionOf(p.data.type)}/${p.id}/`;
export const absUrl = (path: string) => new URL(path, SITE.url).href;
export const projectNumber = (p: Project) => `${SITE.numberPrefix}-${p.data.number}`;
export const topicLabel = (id: string) => topicById(id)?.label ?? id;

export const fmtDate = (d: Date, style: 'long' | 'month' = 'long') =>
  d.toLocaleDateString('en-US', style === 'long'
    ? { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }
    : { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Projects sharing the most topics/keywords with `p`. */
export function related(p: Project, all: Project[], n = 3): Project[] {
  const kw = new Set(p.data.keywords.map((k) => k.toLowerCase()));
  return all
    .filter((o) => o.id !== p.id)
    .map((o) => ({
      o,
      score:
        o.data.topics.filter((t) => p.data.topics.includes(t)).length * 3 +
        o.data.keywords.filter((k) => kw.has(k.toLowerCase())).length +
        (o.data.series && o.data.series === p.data.series ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.o.data.date.getTime() - a.o.data.date.getTime())
    .slice(0, n)
    .map((x) => x.o);
}

/** Deterministic bar heights (0–1) seeded by a string: each project's unique "signal" glyph. */
export function signal(seed: string, bars = 56): number[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Smoothed random walk so the glyph reads like a measured series, not noise.
  let v = rand();
  return Array.from({ length: bars }, () => {
    v = Math.min(1, Math.max(0.08, v + (rand() - 0.5) * 0.45));
    return Math.round(v * 100) / 100;
  });
}
