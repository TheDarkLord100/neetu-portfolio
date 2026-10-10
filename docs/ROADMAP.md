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
- [ ] Add Supabase client helpers (server and browser) and env validation

## Phase 1: Design

- [ ] Mockups for home, catalog, work page, series/collection page and about (done in claude.ai, not Claude Code)
- [ ] Write `DESIGN.md` from the approved mockups

## Phase 2: Data

- [ ] Migration: enums and tables from `docs/Data.md` **(review SQL yourself)**
- [ ] Migration: RLS policies, public reads published only **(review yourself)**
- [ ] Seed placeholder data (the ~15-row set in `docs/Data.md`), plus platforms and genres
- [ ] Generate TypeScript types from Supabase; add a small data-access layer (`lib/data/`)

## Phase 3: Public site

- [ ] Site shell: header, mobile navigation, footer, visible search
- [ ] Shared components: work card, release button, cover image with fallback
- [ ] Home page: intro, featured works, latest works
- [ ] Catalog page (रचनाएँ) with filters: kind, format, genre, platform
- [ ] Work page: poem / story / novel, with releases and "appears in"
- [ ] Series page: parts in order, plus series-level releases
- [ ] Collection and anthology pages: contents, print release, contributors
- [ ] Books page (पुस्तकें): printed collections, anthologies and single-story books
- [ ] About page (परिचय) from `author_profile`
- [ ] Search across titles
- [ ] 404 and empty states

## Phase 4: Admin

- [ ] Supabase Auth login at `/admin`, with server-side session checks **(review yourself)**
- [ ] Works list: search, filter by kind and status
- [ ] Work form: fields, slug transliteration, cover upload, genres, live preview
- [ ] Releases editor within the work form, with per-format fields
- [ ] Members editor for series, collections and anthologies (add, reorder)
- [ ] Platforms and genres management
- [ ] Author profile editor
- [ ] Revalidate public pages on save; publish/unpublish toggle
- [ ] Test the admin with Hindi typing (Google Indic keyboard / phonetic input)

## Phase 5: Quality

- [ ] SEO: metadata per page, `Person` and `Book` JSON-LD, sitemap, robots
- [ ] OG images with the Devanagari font embedded
- [ ] Playwright smoke tests and phone and desktop screenshots of each page
- [ ] Accessibility and design review with web-design-guidelines; fix the findings
- [ ] Performance pass on a throttled mobile profile

## Phase 6: Launch

- [ ] **(you)** Buy the domain
- [ ] Deploy to Vercel; production Supabase env; custom domain
- [ ] **(you)** Replace placeholders with real works
- [ ] A short Hindi guide for her on using the admin

## Later

- [ ] Bulk import (CSV in admin, or Pratilipi metadata)
- [ ] English version at `/en`