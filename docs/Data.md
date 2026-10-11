# Data Model — neetu-portfolio

Status: updated after catalog design · 10 Oct 2026

## Decisions so far

- **Site type:** a hub. Every work links out to where it is published (Pratilipi, Kuku FM, Amazon…). Story text is not hosted on the site.
- **Language:** Hindi first, at `/`; English interface at `/en`. **Works are Hindi-only and are never translated**: titles, synopses and excerpts show in Hindi on English pages too (marked `lang="hi"`). Only the author profile, awards, platforms and genres have English (`_en`) versions.
- **Stack:** Next.js (App Router) + Supabase (Postgres, Auth, Storage).
- **Admin:** an `/admin` route in the same app, behind Supabase Auth. Saving calls `revalidatePath`, so public pages stay static.
- **Content:** placeholders for now. Bulk import (CSV or Pratilipi metadata) is deferred.

## Core idea

Separate **the creative piece** (`works`) from **where it was released** (`releases`). Groupings such as series, compilations and anthologies are works too, linked to their children through `work_members`.

## Enums

| Enum | Values |
|---|---|
| `work_kind` | `poem`, `story`, `novel`, `series`, `collection`, `anthology` |
| `release_format` | `online`, `audiobook`, `print`, `ebook` |
| `work_status` | `draft`, `published` |

- `novel`: a single long story, chaptered on Pratilipi.
- `series`: a multi-part novel. Each part is a `novel` child.
- `collection`: her own compilation, e.g. a poem collection.
- `anthology`: a collaborative compilation with other authors.

## Tables

### `works`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `slug` | text unique | Latin transliteration, editable in admin |
| `kind` | work_kind | |
| `status` | work_status | default `draft` |
| `title_hi` | text not null | |
| `title_en` | text | **unused**: works are Hindi-only |
| `synopsis_hi` | text | |
| `synopsis_en` | text | **unused**: works are Hindi-only |
| `excerpt_hi` | text | optional short excerpt |
| `cover_path` | text | Supabase Storage path |
| `published_on` | date | first appearance, used for sorting |
| `featured` | bool | default false |
| `editor` | text | anthologies only |
| `featured_contributors` | text[] | anthologies only: 2–3 prominent co-authors, shown by name |
| `contributors_total` | int | anthologies only: total authors incl. her; the page shows "और N अन्य लेखक" for the rest |
| `search_text` | text, generated | nukta-free lowercase title + synopsis, for catalog search; not edited by hand |
| `created_at` / `updated_at` | timestamptz | |

### `work_members`

| Column | Type | Notes |
|---|---|---|
| `parent_id` | uuid → works | must be `series` / `collection` / `anthology` |
| `child_id` | uuid → works | |
| `position` | int | order within the parent |
| pk | (`parent_id`, `child_id`) | |

This is many-to-many: a poem can stand alone on Pratilipi *and* appear in a printed collection, with one page either way.

### `releases`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `work_id` | uuid → works | can be any kind, including series or collection |
| `format` | release_format | |
| `platform_id` | uuid → platforms | |
| `url` | text | |
| `released_on` | date | |
| `narrator` | text | audiobook only |
| `publisher` | text | print / ebook |
| `isbn` | text | print |
| `chapter_count` | int | serialised online novels |

### `platforms`

`id`, `slug`, `name_hi`, `name_en`, `logo_path`, `profile_url` (her profile on that platform: About page and footer), `description_hi` / `description_en` (one line for the About page, e.g. "ऑडियोबुक सुनें"), `sort_order`

### `genres` / `work_genres`

- `genres`: `id`, `slug`, `name_hi`, `name_en`
- `work_genres`: `work_id`, `genre_id`

Genres are a table rather than a text array so filter labels have Hindi and English names and can be renamed in one place.

### `author_profile` (single row)

`tagline_hi` / `tagline_en` ("हिंदी कहानीकार और कवयित्री"), `intro_hi` / `intro_en` (short bio: About intro and home teaser), `bio_hi` / `bio_en` (the longer "लेखन का सफ़र"), `quote_hi`, `quote_en`, `photo_path`, `email`, `social_links` (jsonb array of `{name, url}`). Feeds the About page, the home teaser and the footer. Exactly one row (enforced in the database).

### `awards`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk | |
| `title_hi` / `title_en` | text | award or competition name |
| `organiser_hi` / `organiser_en` | text | institution or platform |
| `year` | int | used for grouping |
| `featured` | bool | shown under "प्रमुख सम्मान" (aim for 3–4) |
| `visible` | bool | default true; lets her hide one without deleting it |
| `sort_order` | int | order within featured |

About page: featured awards in full, then a "और सम्मान देखें (n)" disclosure with the rest grouped by year, one line each. Nothing is marked as paid; she decides what to feature, show or hide.

## How real cases map

| Case | Model |
|---|---|
| Short story on Pratilipi | `story` + one `online` release |
| Single-story printed book | the same `story` + a `print` release |
| Poem | `poem` + `online` release |
| Chaptered novel on Pratilipi | `novel` + `online` release with `chapter_count` |
| Two-part novel + audiobook | `series` → two `novel` children. Each part has an `online` release. The Kuku FM `audiobook` release attaches to the series (or to each part, if released separately) |
| Poem / story compilation book | `collection` → its poems/stories, plus a `print` release |
| Collaborative book | `anthology` → her pieces in it, plus a `print` release, with `editor`, `featured_contributors` (2–3 names) and `contributors_total` filled in. Shown as "नीतू सिंह, A, B, C और 24 अन्य लेखक" |
| Chapters | not modelled; `chapter_count` on the release, linking to the Pratilipi series page |

## Rules (enforced in admin form validation, not DB constraints)

- Only `series`, `collection` and `anthology` works may have members.
- A `series` contains only `novel` children.
- `narrator` only for `audiobook`; `publisher` / `isbn` only for `print` / `ebook`; `chapter_count` only for `online`.
- `editor` / `featured_contributors` / `contributors_total` only for `anthology`; at most 3 featured contributors; `contributors_total` ≥ 1 + number of featured.
- Slug is generated from the title by transliteration and stays editable.

## Access (RLS)

- Public: `select` on all tables, with `works` limited to `status = 'published'`. Releases and members of unpublished works are hidden too.
- Admin: full read/write, but only for users listed in an `admins` allowlist table (`user_id` → auth.users), checked in RLS policies. Being logged in alone is not enough.
- Public sign-ups are disabled in Supabase Auth; admin accounts are created by hand in the dashboard.

## Site usage notes

- One canonical URL per work, from `works.slug`.
- A work page shows releases as buttons, "appears in" for its parents, and ordered parts for a series.

## Catalog query rules

- **Lists** `poem`, `story`, `novel` (including series parts) **and whole `series`** (kind chip "धारावाहिक"; the row opens the series page and offers part 1's "पढ़ें" plus the series' own releases). Collections and anthologies are not listed; they are on the Books page.
- **Effective releases** of a work = its own releases **plus** releases of any parent `series`. So a series-level Kuku FM audiobook shows "सुनें" on भाग 1 and भाग 2, and they match the audiobook filter. Releases of a parent `collection` / `anthology` are **not** inherited; those appear as "इसमें भी शामिल: <book>" instead.
- **Filters:**
  - kind (`story` / `poem` / `novel` / `series`)
  - format available (`online` / `audiobook` / `print`, from effective releases)
  - genre
  - platform (from effective releases)
  - saved-only (client-side, see below)
- **Filter logic:** options within a group are OR; groups combine with AND. Counts beside options are totals over all published leaf works (not recalculated per selection).
- **Search:** matches `title_hi` and `synopsis_hi`, case-insensitive, ignoring the nukta (़) so "खामोशी" finds "ख़ामोशी". Implemented as the generated column `works.search_text` (built by `normalize_search_text()`, which strips the nukta in both typed forms and lowercases); the query normalises the search term with the same function and uses `ilike`. For 100+ works this is fine without full-text search.
- **Sort:** newest first (`published_on desc`, default), oldest first, or by title (Hindi collation).
- **Pagination:** page size 10 / 25 / 50 / 100 (default 10). Return the total count with each page.
- **URL state:** `?q=&kind=&format=&genre=&platform=&saved=1&sort=&per=&page=`. Every param is optional, and invalid values fall back to defaults.

## Client-only data: favourites

Not stored in the database. The reader's saved list lives in the browser's `localStorage`:

- Key `neetu-saved-v1`, value: a JSON array of work **slugs** in save order (newest first).
- The site fetches current titles and releases for those slugs. Slugs that no longer resolve (deleted or unpublished) are dropped silently and the stored list is cleaned.
- No login, no syncing between devices. The UI says so.
- If a work's slug changes in admin, saved entries for the old slug stop resolving. Acceptable for now; revisit if slugs change often (could add a `previous_slugs` text[] column).

## Placeholder seed set

- 4 short stories (one also has a `print` release, as the single-story book)
- 3 poems (2 belong to a poem `collection`)
- 1 chaptered `novel` with an `online` release
- 1 `series` with 2 `novel` parts, plus an `audiobook` release on the series
- 1 `anthology` containing one of the stories
- 1 `draft` work, to confirm it stays hidden
- About 24 more simple leaf works (stories, poems, a few novels) so the catalog has 30+ items for testing pagination and filters. The catalog mockup's sample list can be reused.

## Deferred

- Bulk import (CSV in admin, or a Pratilipi metadata script, checking their terms first)
- English text for the author profile and awards (works stay Hindi-only)