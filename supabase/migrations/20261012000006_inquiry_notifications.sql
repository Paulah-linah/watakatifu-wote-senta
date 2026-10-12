-- Watakatifu Wote Senta: call the notify-inquiry Edge Function whenever a new inquiry arrives.
-- The function URL and shared secret live in Supabase Vault (never in the repository):
--   select vault.create_secret('https://<ref>.supabase.co', 'project_url');
--   select vault.create_secret('<random>', 'notify_inquiry_secret');
-- If either secret is missing the trigger does nothing, so inquiries are never blocked by email problems.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_inquiry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_inquiry_secret';
  if v_url is null or v_secret is null then
    return new;
  end if;

  perform net.http_post(
    url := v_url || '/functions/v1/notify-inquiry',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', v_secret),
    body := jsonb_build_object('inquiry_id', new.id),
    timeout_milliseconds := 5000
  );
  return new;
exception when others then
  -- Notification failures must never stop an inquiry from being saved.
  raise warning 'notify_new_inquiry failed: %', sqlerrm;
  return new;
end;
$$;

revoke execute on function public.notify_new_inquiry() from public, anon, authenticated;

create trigger inquiries_notify
  after insert on public.inquiries
  for each row execute function public.notify_new_inquiry();
