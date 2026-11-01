# Clinote

Clinote is a fast, mobile-friendly clinical reference library for study. Notes
are written as Markdown files and organised into specialty folders. The app
provides a consistent note layout, full-text search, tag filtering, dark and
light themes, keyboard navigation, and offline support through a progressive
web app service worker.

> **Medical disclaimer:** Clinote contains personal study notes. The content is
> not independently validated and is not a clinical decision-support tool.
> Always verify information against current, authoritative guidelines. Never
> add patient-identifiable information.

## Requirements

- Node.js compatible with the installed Next.js version
- npm

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run lint       # Check the code with ESLint
npm run build      # Create a production build
npm run start      # Serve the production build
```

## Using the library

- Browse specialties and notes from `/library`.
- Press `Ctrl K` or `/` to open search.
- Search matches titles, aliases, tags, specialty names, and note text.
- Add `#tag` to a search to filter by tag.
- Use the theme toggle to switch between light and dark themes.
- Visit notes while online to make them available to the service worker cache
  for later offline reading.

## Adding a note

Create a `.md` file inside `content/`. Each directory becomes a specialty or
collection, and the filename becomes the default note title. For example:

```text
content/
└── Cardiology/
    └── Acute Heart Failure.md
```

The filename can be human-readable; URL slugs are generated automatically.
If the note needs a title different from its filename, add `title` to its
frontmatter.

### Frontmatter

Frontmatter is optional, but these fields are supported:

```yaml
---
title: Acute Heart Failure
tags:
  - cardiology
  - emergency
aliases:
  - Acute Decompensated Heart Failure
discipline: "[[Cardiology]]"
Sub Pathologies:
  - Left-sided failure
  - Right-sided failure
First Aid:
  - Page 123 (2024 edition)
Compare:
  - Cardiogenic Shock
reviewed: 2026-01-15
sources:
  - title: ESC guideline
    url: https://example.com/guideline
    kind: reference
related:
  - Cardiogenic Shock
---
```

Lists may also be written as comma-separated strings. Dates should use
`YYYY-MM-DD`. `sources` can contain URLs or objects with `title`, `url`, and
`kind` (`reference` or `own`). Wikilink values such as `Compare` may be written
as a YAML list or as a comma-separated wikilink string; both forms are loaded
automatically.

### Note content

Notes support GitHub-flavoured Markdown, including:

- Headings, lists, tables, fenced code blocks, and emphasis
- Math expressions using `$inline$` or `$$display$$`
- Wikilinks such as `[[STEMI]]`, `[[Cardiology]]`, or
  `[[STEMI|ST elevation myocardial infarction]]`
- Callouts using the following structure:

  ```markdown
  > [!summary]- Management
  > - First management point
  > - Second management point
  ```

  Common callout types include `abstract`, `note`, `tip`, `attention`, `check`,
  `fail`, `bug`, `todo`, `summary`, `warning`, `error`, `success`, and
  `example`. Put the clinical content in the callouts so notes retain the
  same scannable structure.

The special callout title `Personal Experience` is kept in source files but
hidden from the rendered library.

## Contributing notes

Contributions are welcome, especially corrections, clearer explanations,
useful cross-links, and notes for currently empty specialties.

1. Create a branch from the latest default branch.
2. Add or edit a Markdown file under `content/`.
3. Keep the note focused and use the standard callout structure where
   possible: definition, pathophysiology, clinical presentation, diagnosis,
   red flags, differentials, management, pitfalls, complications, and a
   typical scenario.
4. Add aliases, tags, related notes, and sources when they improve discovery
   or verification.
5. Check every wikilink and verify that clinical claims reflect current
   guidelines. Do not include patient-identifiable information.
6. Run the checks locally:

   ```bash
   npm run lint
   npm run validate:notes
   npm run build
   ```

   The note validator reports missing review dates and sources as warnings, but
   fails on malformed frontmatter, invalid dates, and other structural errors.

7. Add a `reviewed` date and authoritative `sources` before opening a pull
   request. The validator will highlight omissions while the existing library
   is being brought up to that standard.
8. Open a pull request describing what changed and citing the sources used.

For code or UI changes, follow the existing TypeScript and React patterns,
keep changes focused, and include a clear description of how the change was
tested.

## Project layout

```text
app/         Next.js routes and page layouts
components/ Reusable UI components
content/    Markdown clinical notes grouped by specialty
lib/         Library loading, Markdown processing, and callouts
public/      Static assets and the offline service worker
scripts/     Development utilities
```
