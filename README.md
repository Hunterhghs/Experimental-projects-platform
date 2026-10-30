# H Heuristics — Experimental Projects Platform

Static publishing platform for H Heuristics **reports**, **dashboards** and **projects**, built with [Astro](https://astro.build) and deployed on Cloudflare Pages. Designed to scale to thousands of projects: one content collection, a controlled topic vocabulary, paginated listings, static full-text search (Pagefind) and complete indexing metadata on every page.

## Publishing workflow

### Reports

Reports come in two editions:

| Edition | What readers get | Command |
|---|---|---|
| **PDF** (default) | Landing page with abstract, key insights, record sheet, chapter index that jumps to PDF pages, embedded PDF viewer, download, citation | `npm run ingest -- Report.pdf` |
| **Digital** | Full web-native report: chapters, exhibits, tables, takeaways and references as HTML | `npm run ingest -- Report.docx --digital` |

```bash
npm run ingest -- ~/Desktop/My_Report.pdf                     # PDF edition; uses My_Report.docx for metadata if it sits next to it
npm run ingest -- ~/Desktop/My_Report.docx --digital           # digital edition
npm run ingest -- My_Report.pdf --topics water,climate --featured
```

Metadata comes from the `.docx` when available (most accurate), otherwise straight from the PDF via poppler (`brew install poppler`): title, subtitle, series, author, date, chapters with page numbers, key insights, counts of exhibits, tables and references. Files written:

- `src/content/projects/reports/<year>/<slug>.md`: front matter with number (`HX-YYYY-NNN`), format, title, description, abstract, topics, keywords, chapters, highlights and stats (plus the HTML body for digital editions)
- `public/reports/<slug>/`: the PDF, a cover image, and (digital) every exhibit as WebP

Review the generated `description`, `abstract` and `topics` before publishing: they are drafts. Options: `--slug`, `--date YYYY-MM-DD`, `--number YYYY-NNN`, `--topics a,b`, `--featured`, `--draft`, `--force` (re-ingest an existing slug, keeping its number).

### Dashboards and projects

```bash
npm run new -- dashboard "Global Heat Exposure Explorer" --app ./path/to/built-app --topics climate,public-health
npm run new -- project "Methane Abatement Cost Model" --topics climate,energy-transition
```

`--app` copies a static web app (a folder with `index.html`) to `public/dashboards/<slug>/app/`, and the project page embeds it with an "Open full screen" link. Then fill in the TODOs in the generated Markdown file.

### Digital report pipeline (Veles / Fable-5)

Digital-edition reports are produced by the Veles (Fable-5 × DeepSeek) pipeline, with the main agent acting only as assembler and quality gate:

1. **Veles writes the draft** — the pipeline (Architect → Coder → Verifier) writes the full chapter body to a scratch `draft.md` and returns a PASS/FAIL verdict with evidence.
2. **Veles produces the visuals** — a second pipeline pass writes the matplotlib exhibit scripts, executes them, and verifies the WebP outputs (dimensions, format, cleanup).
3. **Main agent assembles** — converts the draft into `src/content/projects/reports/<year>/<slug>.md` with full front matter, trims to the requested reading time, and places exhibits/tables.
4. **Main agent gates** — runs `prose_lint.py --require-binding-term` (must be 0 errors) and validates topics/number/description against `src/content.config.ts` before commit.

Professional body components available to every digital report (styled in `src/styles/global.css`):

- `.stat-grid` / `.stat-card` — key-stat cards (`.stat-card--warn` for risk stats)
- `.callout` / `.callout--warn` — labelled analytic asides
- `.pull-quote` — editorial pull quote
- `.method-box` — method and sources block
- `figure.exhibit` + `.exhibit__frame` + `figcaption` — framed exhibits with corner brackets
- `.table` + `.table__cap` + `.table__scroll` — data tables
- `.takeaway` — dark takeaway band with signal shadow

Report pages get the professional grade automatically: `body.is-report` applies the dark report hero, abstract card, ink stat band, and (on desktop) a sticky chapter sidebar with the prose column beside it.

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
