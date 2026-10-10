-- Initial schema for neetu-portfolio. Source of truth: docs/Data.md.
--
-- Every table has row level security ENABLED and NO policies, so nothing is
-- readable or writable through the API until the RLS migration adds policies.
-- Business rules (e.g. "a series contains only novels") are enforced in the
-- admin form, not here; this file only enforces basic integrity.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.work_kind as enum ('poem', 'story', 'novel', 'series', 'collection', 'anthology');
create type public.release_format as enum ('online', 'audiobook', 'print', 'ebook');
create type public.work_status as enum ('draft', 'published');

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Keeps updated_at current on every update.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Normalises Hindi text for search: removes the nukta so "खामोशी" matches
-- "ख़ामोशी", whichever way the nukta was typed. Precomposed nukta letters
-- (U+0958–U+095F, e.g. क़) become their base letters, and a separate nukta
-- sign (U+093C) is removed. Also lowercases any Latin text.
create function public.normalize_search_text(input text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(
    translate(
      replace(coalesce(input, ''), U&'\093C', ''),
      U&'\0958\0959\095A\095B\095C\095D\095E\095F',
      U&'\0915\0916\0917\091C\0921\0922\092B\092F'
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- Platforms (Pratilipi, Kuku FM, Amazon, ...)
-- ---------------------------------------------------------------------------

create table public.platforms (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_hi        text not null check (btrim(name_hi) <> ''),
  name_en        text,
  logo_path      text,                -- Supabase Storage path; lettered placeholder when null
  profile_url    text check (profile_url ~ '^https?://'),  -- her profile on this platform
  description_hi text,                -- one line for the About page, e.g. "ऑडियोबुक सुनें"
  description_en text,
  sort_order     int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.platforms is 'Where works are published. Logos and profile links feed release buttons, the About page and the footer.';

-- ---------------------------------------------------------------------------
-- Works: every creative piece, including groupings (series, collection, anthology)
-- ---------------------------------------------------------------------------

create table public.works (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind                  public.work_kind   not null,
  status                public.work_status not null default 'draft',
  title_hi              text not null check (btrim(title_hi) <> ''),
  title_en              text,
  synopsis_hi           text,
  synopsis_en           text,
  excerpt_hi            text,           -- optional short excerpt, line breaks preserved
  cover_path            text,           -- Supabase Storage path; cloth-cover fallback when null
  published_on          date,           -- first appearance, used for sorting
  featured              boolean not null default false,
  editor                text,           -- anthologies only
  featured_contributors text[] not null default '{}',  -- anthologies only: 2–3 named co-authors
  contributors_total    int check (contributors_total >= 1),  -- anthologies only, incl. her
  search_text           text generated always as (
                          public.normalize_search_text(title_hi || ' ' || coalesce(synopsis_hi, ''))
                        ) stored,       -- nukta-free, lowercased; catalog search uses ilike on this
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.works is 'Every creative piece. Series, collections and anthologies are works too, linked to their parts via work_members.';

create index works_status_kind_published_idx on public.works (status, kind, published_on desc);
create index works_featured_idx on public.works (featured) where featured;

-- ---------------------------------------------------------------------------
-- Work members: parts of a series, contents of a collection or anthology
-- ---------------------------------------------------------------------------

create table public.work_members (
  parent_id  uuid not null references public.works (id) on delete cascade,
  child_id   uuid not null references public.works (id) on delete cascade,
  position   int  not null default 0 check (position >= 0),
  primary key (parent_id, child_id),
  check (parent_id <> child_id)
);

comment on table public.work_members is 'Ordered membership: series → novel parts; collection / anthology → poems and stories. Many-to-many.';

create index work_members_child_idx on public.work_members (child_id);

-- ---------------------------------------------------------------------------
-- Releases: where and how a work was published
-- ---------------------------------------------------------------------------

create table public.releases (
  id            uuid primary key default gen_random_uuid(),
  work_id       uuid not null references public.works (id) on delete cascade,
  format        public.release_format not null,
  platform_id   uuid not null references public.platforms (id) on delete restrict,
  url           text not null check (url ~ '^https?://'),
  released_on   date,
  narrator      text,                 -- audiobook only
  publisher     text,                 -- print / ebook only
  isbn          text,                 -- print only
  chapter_count int check (chapter_count > 0),  -- serialised online novels
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.releases is 'One row per place a work was published. A series-level release is inherited by its parts in the catalog.';

create index releases_work_idx on public.releases (work_id);
create index releases_platform_idx on public.releases (platform_id);

-- ---------------------------------------------------------------------------
-- Genres
-- ---------------------------------------------------------------------------

create table public.genres (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_hi    text not null check (btrim(name_hi) <> ''),
  name_en    text,
  created_at timestamptz not null default now()
);

create table public.work_genres (
  work_id  uuid not null references public.works (id) on delete cascade,
  genre_id uuid not null references public.genres (id) on delete cascade,
  primary key (work_id, genre_id)
);

create index work_genres_genre_idx on public.work_genres (genre_id);

-- ---------------------------------------------------------------------------
-- Author profile (exactly one row)
-- ---------------------------------------------------------------------------

create table public.author_profile (
  id           boolean primary key default true check (id),  -- forces a single row
  tagline_hi   text,      -- e.g. "हिंदी कहानीकार और कवयित्री"
  tagline_en   text,
  intro_hi     text,      -- short bio: About intro and the home page teaser
  intro_en     text,
  bio_hi       text,      -- longer "लेखन का सफ़र" paragraphs
  bio_en       text,
  quote_hi     text,
  quote_en     text,
  photo_path   text,      -- Supabase Storage path
  email        text,
  social_links jsonb not null default '[]' check (jsonb_typeof(social_links) = 'array'),
                          -- [{"name": "Instagram", "url": "https://..."}]
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.author_profile is 'Single row. Feeds the About page, the home page teaser and the footer.';

-- ---------------------------------------------------------------------------
-- Awards
-- ---------------------------------------------------------------------------

create table public.awards (
  id           uuid primary key default gen_random_uuid(),
  title_hi     text not null check (btrim(title_hi) <> ''),
  title_en     text,
  organiser_hi text,
  organiser_en text,
  year         int check (year between 1900 and 2100),
  featured     boolean not null default false,  -- shown under "प्रमुख सम्मान"
  visible      boolean not null default true,   -- hide without deleting
  sort_order   int not null default 0,          -- order within featured
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admins allowlist: being logged in is not enough to write
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admins is 'Users allowed to write. Rows are added by hand in the dashboard. Checked by RLS policies.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger set_updated_at before update on public.platforms
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.works
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.releases
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.author_profile
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.awards
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security: on everywhere, no policies yet (deny all).
-- Policies come in the next migration.
-- ---------------------------------------------------------------------------

alter table public.platforms      enable row level security;
alter table public.works          enable row level security;
alter table public.work_members   enable row level security;
alter table public.releases       enable row level security;
alter table public.genres         enable row level security;
alter table public.work_genres    enable row level security;
alter table public.author_profile enable row level security;
alter table public.awards         enable row level security;
alter table public.admins         enable row level security;
