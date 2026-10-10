# neetu-portfolio — project guide for Claude Code

A Hindi-first portfolio and hub site for Neetu (नीतू), a Hindi writer. It lists all her works (poems, stories, novels, multi-part novels, audiobooks, printed books, anthologies) and links out to where each one is published: Pratilipi, Kuku FM, Amazon and others. Story text is not hosted here.

@AGENTS.md

## Read these before working

- `docs/Data.md`: the data model. Source of truth for tables, enums and rules.
- `docs/ROADMAP.md`: the task list. Work on one item at a time.
- `DESIGN.md`: the visual system and the source of truth for design. Never invent colours, fonts, sizes or spacing outside it; if something is missing, ask and add it there first. `docs/design-notes.md` is the earlier working record it was built from; don't follow it where the two differ.
- `docs/v2_suggestions.md`: ideas deliberately left out of the first version. Don't build them unless I ask.
- `docs/mockups/`: approved page images (phone 390px and desktop 1440px, every variant), indexed in `docs/mockups/INDEX.md`. When building a page, open its images and match them; compare your Playwright screenshots against them. If an image and DESIGN.md disagree, DESIGN.md wins.

## Stack

- Next.js (App Router, TypeScript strict, Tailwind CSS), npm
- Supabase: Postgres, Auth (admin only), Storage (covers, photos)
- Deployed on Vercel

## Commands

- `npm run dev`: local dev server at http://localhost:3000
- `npm run lint`
- `npx tsc --noEmit`: typecheck
- `npm run build`
- `npx playwright test`: smoke tests and screenshots, once set up

## How I work with you

I make decisions and review results; I don't read most of the code. So:

1. **Plan first.** For any task beyond a one-line fix, propose a plan and wait for approval. List every assumption and every choice you are making on my behalf.
2. **Ask before** adding a dependency, changing the database schema or RLS, changing auth, or changing anything in `docs/Data.md` or `DESIGN.md`.
3. **Stay in scope.** Do only the current roadmap item. Note other problems you find instead of fixing them.
4. **Before saying a task is done**, run lint, typecheck and build, and make sure all pass.
5. **End every task with a summary:**
   - What changed (files, in plain language)
   - Decisions made and why
   - Anything left unfinished or worth my attention
   - How to try it (URL or steps)
   - For UI work: phone (390px) and desktop screenshots
6. **Commit** at the end of each task on the current feature branch, with a clear message. Never push to `main` or force-push without asking.
7. Tick the item in `docs/ROADMAP.md` once I've approved it.

## Language and content rules

- Hindi is the primary language and lives at `/`. English comes later at `/en`. Set things up so adding it doesn't need a rewrite:
  - No hard-coded UI strings in components. Put them in the messages files (`messages/hi.json`, with `messages/en.json` alongside).
  - Use `_hi` / `_en` columns for translatable data. Show `_hi` until English is enabled.
- Page `<html lang="hi">`.
- Page addresses are English (`/works`, `/work/<slug>`, `/books`, `/book/<slug>`, `/about`); slugs are transliterated Hindi in Latin script (e.g. `/work/barish-ki-raat`), never Devanagari. Build links with `lib/routes.ts`.
- Release buttons are labelled by action, not platform: पढ़ें (read), सुनें (listen), खरीदें (buy), with the platform logo beside the label.

## UI rules (always apply, alongside DESIGN.md)

- Mobile first. Design for a 390px-wide phone, then scale up.
- Readers include older, non-technical people: body text at least 17px, line-height 1.7 or more for Devanagari, tap targets at least 44px, high contrast, no hover-only interactions, no hidden gestures.
- Navigation has at most 4 top-level sections, and search stays visible.
- Fonts via `next/font` with the Devanagari subset.
- Keep pages light: optimised images through `next/image`, no heavy animation libraries.
- Nothing moves on its own: no auto-rotating carousels or auto-advancing content. The featured carousel changes only when the reader taps.
- If a design skill's advice conflicts with DESIGN.md or these rules, DESIGN.md and this file win.

## Client-side features

- **Catalog state lives in the URL** (search params: `q`, `kind`, `format`, `genre`, `platform`, `saved`, `sort`, `per`, `page`). Back button and shared links must restore the exact view. Any change other than `page` resets `page` to 1. On page change, scroll to the top of the results.
- **Favourites** use `localStorage` key `neetu-saved-v1` (JSON array of work slugs). Only read or write it in client components, after mount (in an effect), never during render, so there is no hydration mismatch. Wrap every access in try/catch and treat failure as an empty list. Listen for the `storage` event so other tabs stay in sync. Drop slugs that no longer resolve.
- **Voice search** is a progressive enhancement: use `window.SpeechRecognition || window.webkitSpeechRecognition` with `lang = 'hi-IN'` and interim results. Feature-detect after mount. If it's unsupported, permission is denied or recognition fails, show the Hindi fallback messages from DESIGN.md (§8) and keep typing working. Never block search on it. Stop recognition on unmount.
- **Search matching** ignores the nukta (़) and case on both the query and the data.
- Don't add libraries for any of these; the browser APIs are enough.

## Data and security rules

- Public pages read only `published` works. RLS enforces this; don't rely on query filters alone.
- Every admin page and server action verifies the Supabase session on the server.
- Supabase keys: use the **publishable key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) in app code, browser and server alike, and let RLS do the protecting. Do not use the legacy `anon` / `service_role` keys. Don't add the **secret key** (it bypasses RLS) unless I approve a specific server-only need; if added, it is never in client components and never committed. Secrets live in `.env.local`, which is git-ignored.
- Public sign-ups are disabled in Supabase. Admin write access must also check an explicit admin allowlist, not just "is logged in".
- Schema changes are SQL migration files in `supabase/migrations/`. I review these myself.
- After an admin save, revalidate the affected public paths.

## Out of scope for now

- Bulk import of existing works (placeholders only)
- English content and `/en` routes