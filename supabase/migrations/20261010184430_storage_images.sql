-- Storage for images: one public bucket "images" with three folders.
--   covers/     work and book covers      (works.cover_path)
--   author/     her photo                 (author_profile.photo_path)
--   platforms/  platform logos            (platforms.logo_path)
--
-- Anyone can view a file through its public URL (public bucket).
-- There is no public SELECT policy, so visitors cannot list the bucket.
-- Only admins (public.is_admin(), from the RLS migration) can upload,
-- replace or delete. Type and size limits are enforced by the bucket itself.

-- ---------------------------------------------------------------------------
-- Bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']  -- no SVG: it can carry scripts
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Policies on storage.objects (RLS is already enabled there by Supabase)
-- ---------------------------------------------------------------------------

-- Admins can list and read objects (needed for the admin UI, replacing and deleting).
create policy "Admins read images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'images' and (select public.is_admin()));

-- Admins can upload, only into the three known folders.
create policy "Admins upload images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and (select public.is_admin())
    and (storage.foldername(name))[1] in ('covers', 'author', 'platforms')
  );

-- Admins can replace files (upsert), keeping them in the known folders.
create policy "Admins update images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'images' and (select public.is_admin()))
  with check (
    bucket_id = 'images'
    and (select public.is_admin())
    and (storage.foldername(name))[1] in ('covers', 'author', 'platforms')
  );

-- Admins can delete.
create policy "Admins delete images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images' and (select public.is_admin()));
