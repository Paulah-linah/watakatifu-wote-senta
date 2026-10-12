-- Watakatifu Wote Senta: media bucket for site images (public read, staff write)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;

create policy "Staff upload media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_staff()));

create policy "Staff update media" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_staff()))
  with check (bucket_id = 'media' and (select public.is_staff()));

create policy "Staff delete media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_staff()));
