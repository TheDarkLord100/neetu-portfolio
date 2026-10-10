-- Access rules (RLS policies). Source of truth: docs/Data.md, "Access (RLS)".
--
-- Public visitors (anon) and logged-in non-admins see only published content.
-- Admins (users listed in public.admins) can read and write everything.
-- public.admins itself is never writable through the API: rows are added by
-- hand in the Supabase dashboard.

-- ---------------------------------------------------------------------------
-- is_admin(): true when the current user is in the admins allowlist.
-- SECURITY DEFINER so it can read public.admins, which is locked by RLS.
-- ---------------------------------------------------------------------------

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Published-work check used by the dependent tables' public policies.
create function public.is_published_work(work uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.works where id = work and status = 'published'
  );
$$;

revoke execute on function public.is_published_work(uuid) from public;
grant execute on function public.is_published_work(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Table privileges. RLS policies below narrow these down; stated explicitly
-- so access doesn't depend on the project's default grants.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on
  public.works, public.work_members, public.releases, public.platforms,
  public.genres, public.work_genres, public.author_profile, public.awards
to anon, authenticated;

grant insert, update, delete on
  public.works, public.work_members, public.releases, public.platforms,
  public.genres, public.work_genres, public.author_profile, public.awards
to authenticated;

-- admins: logged-in users may read (their own row only, see policy). No writes.
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- works
-- ---------------------------------------------------------------------------

create policy "Public reads published works"
  on public.works for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins read all works"
  on public.works for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins write works"
  on public.works for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- releases: visible when their work is published
-- ---------------------------------------------------------------------------

create policy "Public reads releases of published works"
  on public.releases for select
  to anon, authenticated
  using (public.is_published_work(work_id));

create policy "Admins write releases"
  on public.releases for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- work_members: visible only when BOTH the book and the part are published
-- ---------------------------------------------------------------------------

create policy "Public reads members where both sides are published"
  on public.work_members for select
  to anon, authenticated
  using (public.is_published_work(parent_id) and public.is_published_work(child_id));

create policy "Admins write work members"
  on public.work_members for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- work_genres: visible when the work is published
-- ---------------------------------------------------------------------------

create policy "Public reads genres of published works"
  on public.work_genres for select
  to anon, authenticated
  using (public.is_published_work(work_id));

create policy "Admins write work genres"
  on public.work_genres for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- platforms, genres, author_profile: public reference data
-- ---------------------------------------------------------------------------

create policy "Public reads platforms"
  on public.platforms for select
  to anon, authenticated
  using (true);

create policy "Admins write platforms"
  on public.platforms for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Public reads genres"
  on public.genres for select
  to anon, authenticated
  using (true);

create policy "Admins write genres"
  on public.genres for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Public reads author profile"
  on public.author_profile for select
  to anon, authenticated
  using (true);

create policy "Admins write author profile"
  on public.author_profile for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- awards: public sees visible ones only
-- ---------------------------------------------------------------------------

create policy "Public reads visible awards"
  on public.awards for select
  to anon, authenticated
  using (visible);

create policy "Admins read all awards"
  on public.awards for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins write awards"
  on public.awards for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- admins: each logged-in user can see only their own row (lets the admin UI
-- check "am I an admin?"). No insert/update/delete policies: dashboard only.
-- ---------------------------------------------------------------------------

create policy "Users read their own admin row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));
