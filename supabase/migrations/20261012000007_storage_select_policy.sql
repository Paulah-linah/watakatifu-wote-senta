-- Storage delete and upsert need staff to be able to select their media objects through the API.
-- (Public visitors read images through public URLs, which do not need this policy.)
create policy "Staff read media objects" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_staff()));
