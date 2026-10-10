# Data Model — neetu-portfolio

Status: draft for review · 10 Oct 2026

## Decisions so far

- **Site type:** a hub. Every work links out to where it is published (Pratilipi, Kuku FM, Amazon…). Story text is not hosted on the site.
- **Language:** Hindi first, at `/`. English comes later at `/en`, so translatable fields get `_hi` / `_en` columns from day one, with `_en` left empty for now.
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
| `title_en` | text | |
| `synopsis_hi` | text | |
| `synopsis_en` | text | |
| `excerpt_hi` | text | optional short excerpt |
| `cover_path` | text | Supabase Storage path |
| `published_on` | date | first appearance, used for sorting |
| `featured` | bool | default false |
| `editor` | text | anthologies only |
| `contributors` | text | anthologies only, e.g. "with X, Y, Z" |
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

`id`, `slug`, `name_hi`, `name_en`, `logo_path`

### `genres` / `work_genres`

- `genres`: `id`, `slug`, `name_hi`, `name_en`
- `work_genres`: `work_id`, `genre_id`

Genres are a table rather than a text array so filter labels have Hindi and English names and can be renamed in one place.

### `author_profile` (single row)

`bio_hi`, `bio_en`, `photo_path`, `awards_hi`, `awards_en`, social links. Feeds the About page and the footer.

## How real cases map

| Case | Model |
|---|---|
| Short story on Pratilipi | `story` + one `online` release |
| Single-story printed book | the same `story` + a `print` release |
| Poem | `poem` + `online` release |
| Chaptered novel on Pratilipi | `novel` + `online` release with `chapter_count` |
| Two-part novel + audiobook | `series` → two `novel` children. Each part has an `online` release. The Kuku FM `audiobook` release attaches to the series (or to each part, if released separately) |
| Poem / story compilation book | `collection` → its poems/stories, plus a `print` release |
| Collaborative book | `anthology` → her pieces in it, plus a `print` release, with `editor` / `contributors` filled in |
| Chapters | not modelled; `chapter_count` on the release, linking to the Pratilipi series page |

## Rules (enforced in admin form validation, not DB constraints)

- Only `series`, `collection` and `anthology` works may have members.
- A `series` contains only `novel` children.
- `narrator` only for `audiobook`; `publisher` / `isbn` only for `print` / `ebook`; `chapter_count` only for `online`.
- `editor` / `contributors` only for `anthology`.
- Slug is generated from the title by transliteration and stays editable.

## Access (RLS)

- Public: `select` on all tables, with `works` limited to `status = 'published'`. Releases and members of unpublished works are hidden too.
- Admin: full read/write, but only for users listed in an `admins` allowlist table (`user_id` → auth.users), checked in RLS policies. Being logged in alone is not enough.
- Public sign-ups are disabled in Supabase Auth; admin accounts are created by hand in the dashboard.

## Site usage notes

- One canonical URL per work, from `works.slug`.
- The catalog lists leaf works (poem / story / novel). Books and series appear as their own filter group.
- Filters: kind, format available (e.g. has audiobook), genre, platform.
- A work page shows releases as buttons, "appears in" for its parents, and ordered parts for a series.

## Placeholder seed set (~15 rows)

- 4 short stories (one also has a `print` release, as the single-story book)
- 3 poems (2 belong to a poem `collection`)
- 1 chaptered `novel` with an `online` release
- 1 `series` with 2 `novel` parts, plus an `audiobook` release on the series
- 1 `anthology` containing one of the stories
- 1 `draft` work, to confirm it stays hidden

## Deferred

- Bulk import (CSV in admin, or a Pratilipi metadata script, checking their terms first)
- English content and the `/en` routes