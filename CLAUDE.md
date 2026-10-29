# Publishing playbook (for Claude sessions)

The user uploads documents or content and expects them published live. The site deploys automatically from `main` on Cloudflare Pages, so publishing = commit + push.

## Report from a .docx (and optional .pdf)
1. `npm run ingest -- "/path/to/Report.docx"` (finds a same-named .pdf; or pass `--pdf`).
2. Open the generated `src/content/projects/reports/<year>/<slug>.md` and improve the front matter:
   - `description`: ≤ 300 chars, summarises the whole report (the auto version is just the first paragraph).
   - `abstract`: 3–5 sentences.
   - `topics`: ids from `src/data/topics.mjs`, the most relevant first (the first is shown on cards).
   - add a few high-value `keywords` and `regions` where obvious.
3. `npm run build` must pass (schema errors fail the build). Spot-check the page with `npm run preview`.
4. Commit only that report's files (`src/content/...md` + `public/reports/<slug>/`) with a message like `Add report HX-2026-002: <title>`, then push to `main`.

## Dashboards / projects
`npm run new -- dashboard "Title" --app <dir-with-index.html> --topics a,b`, fill in the TODOs, build, commit, push.

## Rules
- Never renumber or rename slugs of published projects: URLs and identifiers are permanent.
- Keep figures in WebP (the ingest script converts automatically).
- Document format the ingest expects: bold paragraph headings, `Chapter NN: Title`, `Exhibit N: caption` + `Data Source:` below figures, `Table N: title` above tables, single-cell "KEY TAKEAWAY" boxes, `[n]` references under a references / reading-list heading.
