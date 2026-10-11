# Roadmap — neetu-portfolio

One item per Claude Code session. Plan → approve → build → review → tick.
Items marked **(you)** are done by you, not Claude.

## Phase 0: Setup

- [x] **(you)** Install Node.js LTS, Git for Windows and Claude Code
- [x] **(you)** Create the Next.js app (`neetu-portfolio`), push to GitHub, and add `CLAUDE.md`, `docs/Data.md` and this roadmap
- [x] **(you)** Create a Supabase project (Mumbai region), disable public sign-ups, and put the URL and publishable key in `.env.local`
- [x] **(you)** Link the Supabase CLI to the project (`npx supabase init`, `login`, `link`)
- [x] **(you)** Add skills to `.claude/skills/`: web-design-guidelines and one Taste sub-skill
- [x] Clean the starter app (remove boilerplate), set `lang="hi"`, and add an empty layout with Devanagari fonts
- [x] Set up i18n structure: Hindi at `/`, `messages/hi.json` and `messages/en.json`, no English routes yet
- [x] Add Supabase client helpers (server and browser) and env validation

## Phase 1: Design

Mockups are made in claude.ai, not Claude Code. Decisions are recorded in `docs/design-notes.md` as each page is approved.

- [x] Home page mockup (incl. tap-only featured carousel and saved-works section)
- [x] Catalog page mockup (search with voice, filters, pagination, favourites, empty state)
- [x] Work page mockup (one release, four releases, series part; share; "appears in"; more like this)
- [x] Series / collection / anthology page mockup (anthology: 3 named co-authors + "और N अन्य")
- [x] About page mockup (featured awards + "और सम्मान देखें" by year)
- [x] Books list page (पुस्तकें) mockup
- [x] **(you)** Add `public/textures/` (paper images) and `docs/mockups/` (page images) to the repo
- [x] Generate `DESIGN.md` (repo root) from `docs/design-notes.md` + `docs/mockups/`: tokens (colour, type scale, spacing, radius, shadows), components with states, page layouts, behaviour rules. Where the images and design-notes disagree, design-notes wins; list any disagreement for me instead of choosing. I review before it's committed.

## Phase 2: Data

- [x] Migration: enums and tables from `docs/Data.md` **(review SQL yourself)**
- [x] Migration: RLS policies, public reads published only **(review yourself)**
- [x] Storage buckets for covers and author photo: public read, admin-only upload **(review yourself)**
- [x] Seed placeholder data (the set in `docs/Data.md`, at least 30 leaf works so pagination can be tested), plus platforms and genres
- [x] Generate TypeScript types from Supabase; add a small data-access layer (`lib/data/`)

## Phase 3: Public site

- [x] Site shell: paper background (texture layers), header, mobile 4-tab navigation, footer, visible search
- [x] Shared components: release "stamp" button, cloth-cover fallback, work row (contents style), save (bookmark) button
- [x] Home page: featured carousel (tap-only, never auto-rotates), latest works, browse-by-kind panel, books strip, about teaser
- [x] Catalog page (रचनाएँ): list + kind chips + filter groups (format, genre, platform), active-filter chips, count, sort, empty state
- [x] Catalog: all filters, search, sort, page and page size kept in the URL (back button and shared links restore them)
- [x] Catalog: pagination with page size 10 / 25 / 50 / 100 (default 10); reset to page 1 when anything else changes; scroll to top of results on page change
- [x] Search with voice input (`hi-IN`, browser Speech Recognition, progressive enhancement with Hindi fallback messages), on the रचनाएँ page only (no header search)
- [x] Favourites in local storage: save button on works, "सिर्फ़ सहेजी हुई" filter, "आपकी सहेजी रचनाएँ" section on the home page (hidden when empty)
- [x] Work page: poem / story / novel, with releases and "appears in"
- [ ] Series page: parts in order, plus series-level releases
- [ ] Collection and anthology pages: contents, print release, contributors
- [ ] Books page (पुस्तकें): printed collections, anthologies and single-story books
- [ ] About page (परिचय) from `author_profile`
- [ ] 404 page and remaining empty states
- [ ] Privacy note (one short page): voice search sends audio to the browser's speech service; saved list stays on the device

## Phase 4: Admin

- [ ] Supabase Auth login at `/admin`, with server-side session checks **(review yourself)**
- [ ] Works list: search, filter by kind and status
- [ ] Work form: fields, slug transliteration, cover upload, genres, live preview
- [ ] Releases editor within the work form, with per-format fields
- [ ] Members editor for series, collections and anthologies (add, reorder)
- [ ] Platforms and genres management
- [ ] Author profile editor
- [ ] Awards editor: add/edit/hide, mark featured, reorder featured
- [ ] Revalidate public pages on save (`updateTag("works")` for works, releases, members, genres, platforms; `updateTag("site")` for author profile and awards; see `lib/data/store.ts`, `lib/data/site.ts`); publish/unpublish toggle
- [ ] Test the admin with Hindi typing (Google Indic keyboard / phonetic input)

## Phase 5: Quality

- [ ] SEO: metadata per page, `Person` and `Book` JSON-LD, sitemap, robots
- [ ] OG images with the Devanagari font embedded
- [ ] Playwright smoke tests and phone and desktop screenshots of each page, incl. catalog filters + pagination, saving a work and seeing it on the home page
- [ ] **(you)** Test voice search on a real Android phone in Chrome
- [ ] Accessibility and design review with web-design-guidelines; fix the findings
- [ ] Performance pass on a throttled mobile profile

## Phase 6: Launch

- [ ] **(you)** Buy the domain
- [ ] Deploy to Vercel; production Supabase env; custom domain
- [ ] **(you)** Replace placeholders with real works
- [ ] **(you)** Platform logos: official files from each platform's brand/press page as PNG or WebP, at least 256px square (no SVG; the storage bucket refuses it). Lettered placeholders until then; uploaded via admin
- [ ] A short Hindi guide for her on using the admin

## Later

- [ ] Bulk import (CSV in admin, or Pratilipi metadata)
- [x] English version at `/en`: routes, header switch, translated interface (enabled early, during the home page)
- [ ] English content for the author profile (tagline, intro, bio, quote) and awards, in admin. Works are never translated.