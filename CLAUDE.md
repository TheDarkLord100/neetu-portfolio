# Author Hub — project guide for Claude Code

A Hindi-first portfolio and hub site for a Hindi writer, [AUTHOR NAME]. It lists all her works (poems, stories, novels, multi-part novels, audiobooks, printed books, anthologies) and links out to where each one is published: Pratilipi, Kuku FM, Amazon and others. Story text is not hosted here.

@AGENTS.md

## Read these before working

- `docs/Data.md`: the data model. Source of truth for tables, enums and rules.
- `docs/ROADMAP.md`: the task list. Work on one item at a time.
- `DESIGN.md`: the visual system (added after the mockups). Never invent colours, fonts or spacing outside it.

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
- URLs and slugs are Latin script (transliterated, e.g. `/rachna/barish-ki-raat`), never Devanagari.
- Release buttons are labelled by action, not platform: पढ़ें (read), सुनें (listen), खरीदें (buy), with the platform logo beside the label.

## UI rules (until DESIGN.md exists)

- Mobile first. Design for a 390px-wide phone, then scale up.
- Readers include older, non-technical people: body text at least 17px, line-height 1.7 or more for Devanagari, tap targets at least 44px, high contrast, no hover-only interactions, no hidden gestures.
- Navigation has at most 4 top-level sections, and search stays visible.
- Fonts via `next/font` with the Devanagari subset.
- Keep pages light: optimised images through `next/image`, no heavy animation libraries.

## Data and security rules

- Public pages read only `published` works. RLS enforces this; don't rely on query filters alone.
- Every admin page and server action verifies the Supabase session on the server.
- The Supabase service-role key is server-only: never in client components, never committed. Secrets live in `.env.local`, which is git-ignored.
- Schema changes are SQL migration files in `supabase/migrations/`. I review these myself.
- After an admin save, revalidate the affected public paths.

## Out of scope for now

- Bulk import of existing works (placeholders only)
- English content and `/en` routes
