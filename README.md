# H Heuristics — Experimental Projects Platform

Static publishing platform for H Heuristics **reports**, **dashboards** and **projects**, built with [Astro](https://astro.build) and deployed on Cloudflare Pages. Designed to scale to thousands of projects: one content collection, a controlled topic vocabulary, paginated listings, static full-text search (Pagefind) and complete indexing metadata on every page.

## Publishing workflow

### Reports (from an H Heuristics monograph .docx)

```bash
npm run ingest -- ~/Desktop/My_Report.docx            # picks up My_Report.pdf next to it automatically
npm run ingest -- My_Report.docx --topics water,climate --featured
```

The ingest script:

- converts the Word document to web HTML: chapters → `<h2>`, exhibits → `<figure>` with captions and sources, tables, key-takeaway callouts and the reference list
- re-encodes figures as WebP and copies the PDF to `public/reports/<slug>/`
- writes `src/content/projects/reports/<year>/<slug>.md` with front matter: number (`HX-YYYY-NNN`), title, subtitle, series, description, abstract, topics, keywords, chapters, highlights and stats

Review the generated `description`, `abstract` and `topics` before publishing: they are good drafts, not final copy. Options: `--slug`, `--date YYYY-MM-DD`, `--number YYYY-NNN`, `--topics a,b`, `--featured`, `--draft`, `--force` (re-ingest an existing slug).

### Dashboards and projects

```bash
npm run new -- dashboard "Global Heat Exposure Explorer" --app ./path/to/built-app --topics climate,public-health
npm run new -- project "Methane Abatement Cost Model" --topics climate,energy-transition
```

`--app` copies a static web app (a folder with `index.html`) to `public/dashboards/<slug>/app/`, and the project page embeds it with an "Open full screen" link. Then fill in the TODOs in the generated Markdown file.

### Build and preview

```bash
npm install
npm run build      # astro build + Pagefind search index → dist/
npm run preview    # http://localhost:4321
```

## Metadata and indexing

Every project page emits:

| Purpose | Metadata |
|---|---|
| Search engines | `<title>`, meta description, canonical URL, schema.org JSON-LD (`Report` / `WebApplication` / `CreativeWork` + `BreadcrumbList`) |
| Google Scholar | Highwire Press `citation_*` tags, including `citation_pdf_url` and report number |
| Libraries and repositories | Dublin Core `DC.*` tags |
| Social sharing | Open Graph and Twitter cards (cover image = first exhibit) |
| Aggregators and AI agents | `/sitemap-index.xml`, `/rss.xml`, `/catalog.json`, `/llms.txt`, `/robots.txt` |

Readers get a suggested citation in APA and BibTeX on every page.

## Content model

All projects share one schema (`src/content.config.ts`):

```
src/content/projects/
  reports/2026/<slug>.md        → /reports/<slug>/
  dashboards/2026/<slug>.md     → /dashboards/<slug>/
  projects/2026/<slug>.md       → /projects/<slug>/
public/<section>/<slug>/        → figures, PDFs, embedded apps
```

- Topics come from the controlled vocabulary in `src/data/topics.mjs`. Add a topic there and it gets a page automatically.
- Site-wide settings (domain, name, identifier prefix, licence, page size) are in `src/site.config.mjs`.
- New project types: add to `TYPES` in `src/site.config.mjs` and the `type` enum in `src/content.config.ts`.

## Deploying on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → pick this repository.
2. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Environment variable: `SITE_URL` = your public URL (for example `https://projects.hheuristics.com`). Canonical URLs, the sitemap and citation tags are built from it.
4. After the first deploy: **Custom domains** → add the subdomain.

Every push to `main` redeploys the site. `public/_headers` sets security and caching headers.

---

© H Heuristics · Hunter Hughes. Content is CC BY 4.0 unless stated otherwise.
