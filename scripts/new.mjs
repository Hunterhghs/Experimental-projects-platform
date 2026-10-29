#!/usr/bin/env node
// Scaffold a dashboard or project entry.
//
//   npm run new -- dashboard "Global Heat Exposure Explorer" [--app path/to/built-app] [--topics climate,public-health]
//   npm run new -- project   "Methane Abatement Cost Model" [--topics climate]
//
// --app copies a static web app (a folder containing index.html) to
// public/<section>/<slug>/app/ and embeds it on the project page.

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { TOPIC_IDS } from '../src/data/topics.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SECTIONS = { dashboard: 'dashboards', project: 'projects', report: 'reports' };

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    app: { type: 'string' },
    topics: { type: 'string', default: 'systemic-risk' },
    slug: { type: 'string' },
    date: { type: 'string' },
    experimental: { type: 'boolean', default: true },
  },
});
const [type, title] = positionals;
if (!SECTIONS[type] || !title) {
  console.error('Usage: npm run new -- <dashboard|project|report> "Title" [--app dir] [--topics a,b] [--slug s]');
  process.exit(1);
}
const topics = opt.topics.split(',').map((s) => s.trim());
const bad = topics.filter((t) => !TOPIC_IDS.includes(t));
if (bad.length) { console.error(`Unknown topic(s): ${bad.join(', ')}. Valid: ${TOPIC_IDS.join(', ')}`); process.exit(1); }

const slug = opt.slug || title.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const date = opt.date || new Date().toISOString().slice(0, 10);
const year = date.slice(0, 4);
const section = SECTIONS[type];
const contentRoot = path.join(ROOT, 'src/content/projects');

const existing = fs.globSync('**/*.md', { cwd: contentRoot });
if (existing.some((f) => path.basename(f, '.md') === slug)) { console.error(`Slug "${slug}" already exists.`); process.exit(1); }
const nums = existing
  .map((f) => fs.readFileSync(path.join(contentRoot, f), 'utf8').match(/^number:\s*"?(\d{4})-(\d+)"?/m))
  .filter((m) => m && m[1] === year)
  .map((m) => Number(m[2]));
const number = `${year}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`;

let embed;
if (opt.app) {
  if (!fs.existsSync(path.join(opt.app, 'index.html'))) { console.error(`${opt.app} has no index.html`); process.exit(1); }
  const dest = path.join(ROOT, 'public', section, slug, 'app');
  fs.cpSync(opt.app, dest, { recursive: true });
  embed = `/${section}/${slug}/app/`;
}

const md = `---
type: ${type}
number: "${number}"
title: ${JSON.stringify(title)}
subtitle: ""
description: "TODO: one or two sentences (under 300 characters) that say what this ${type} shows and why it matters."
topics: [${topics.map((t) => JSON.stringify(t)).join(', ')}]
keywords: []
date: ${date}
${embed ? `embed: "${embed}"\n` : ''}status: ${opt.experimental ? 'experimental' : 'published'}
---

<p>TODO: describe the ${type}: what data it uses, how to read it, and its main findings.</p>

<h2 id="method">Method and sources</h2>

<p>TODO</p>
`;
const dir = path.join(contentRoot, section, year);
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${slug}.md`);
fs.writeFileSync(file, md.replace('subtitle: ""\n', ''));
console.log(`✓ ${type} ${number} → ${path.relative(ROOT, file)}${embed ? `\n  app embedded from ${embed}` : ''}\n  url /${section}/${slug}/`);
