-- Watakatifu Wote Senta: role helpers + row level security
--
-- Areas and who may manage them:
--   settings, staff     primary_admin
--   hospitality         primary_admin, hospitality_editor   (halls, rooms, catering, laundry)
--   bookings            primary_admin, hospitality_editor   (read also: ministry_editor)
--   ministry            primary_admin, ministry_editor      (mass, retreats, formation)
--   events              primary_admin, hospitality_editor, ministry_editor
--   products            primary_admin, products_editor
--   gallery             every active staff member

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so policies can read staff_profiles without recursion)
-- ---------------------------------------------------------------------------
create or replace function public.current_staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.staff_profiles where id = auth.uid() and is_active
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.current_staff_role() is not null
$$;

create or replace function public.can_manage(area text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    case area
      when 'settings'      then r = 'primary_admin'
      when 'staff'         then r = 'primary_admin'
      when 'hospitality'   then r in ('primary_admin', 'hospitality_editor')
      when 'bookings'      then r in ('primary_admin', 'hospitality_editor')
      when 'bookings_read' then r in ('primary_admin', 'hospitality_editor', 'ministry_editor')
      when 'ministry'      then r in ('primary_admin', 'ministry_editor')
      when 'events'        then r in ('primary_admin', 'hospitality_editor', 'ministry_editor')
      when 'products'      then r in ('primary_admin', 'products_editor')
      when 'gallery'       then r is not null
      else false
    end,
    false)
  from (select public.current_staff_role() as r) s
$$;

-- Which inquiry types the current staff member may see and work on.
create or replace function public.inquiry_visible(t public.inquiry_type)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    case public.current_staff_role()
      when 'primary_admin'      then true
      when 'hospitality_editor' then t in ('conference', 'accommodation', 'catering', 'general')
      when 'ministry_editor'    then t in ('retreat', 'formation', 'event', 'general')
      when 'products_editor'    then t in ('product', 'general')
    end,
    false)
$$;

revoke execute on function public.current_staff_role(), public.is_staff(), public.can_manage(text),
  public.inquiry_visible(public.inquiry_type) from public, anon;
grant execute on function public.current_staff_role(), public.is_staff(), public.can_manage(text),
  public.inquiry_visible(public.inquiry_type) to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------
alter table public.staff_profiles        enable row level security;
alter table public.site_settings         enable row level security;
alter table public.facilities            enable row level security;
alter table public.accommodation_options enable row level security;
alter table public.catering_services     enable row level security;
alter table public.laundry_services      enable row level security;
alter table public.mass_schedules        enable row level security;
alter table public.retreats              enable row level security;
alter table public.formation_programs    enable row level security;
alter table public.events                enable row level security;
alter table public.product_categories    enable row level security;
alter table public.products              enable row level security;
alter table public.gallery_images        enable row level security;
alter table public.inquiries             enable row level security;
alter table public.inquiry_activity      enable row level security;
alter table public.facility_bookings     enable row level security;

-- Defence in depth: the public role can never write, and never touches private tables.
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke all on public.staff_profiles, public.inquiries, public.inquiry_activity, public.facility_bookings from anon;
revoke truncate on all tables in schema public from authenticated;

-- ---------------------------------------------------------------------------
-- Published content: public read, area editors write
-- ---------------------------------------------------------------------------
do $$
declare
  rec record;
begin
  for rec in
    select * from (values
      ('facilities', 'hospitality'),
      ('accommodation_options', 'hospitality'),
      ('catering_services', 'hospitality'),
      ('laundry_services', 'hospitality'),
      ('mass_schedules', 'ministry'),
      ('retreats', 'ministry'),
      ('formation_programs', 'ministry'),
      ('events', 'events'),
      ('products', 'products'),
      ('gallery_images', 'gallery')
    ) as v(tbl, area)
  loop
    execute format(
      'create policy "Public reads published %1$s" on public.%1$I for select to anon, authenticated
         using (is_published or (select public.can_manage(%2$L)))', rec.tbl, rec.area);
    execute format(
      'create policy "Editors insert %1$s" on public.%1$I for insert to authenticated
         with check ((select public.can_manage(%2$L)))', rec.tbl, rec.area);
    execute format(
      'create policy "Editors update %1$s" on public.%1$I for update to authenticated
         using ((select public.can_manage(%2$L))) with check ((select public.can_manage(%2$L)))', rec.tbl, rec.area);
    execute format(
      'create policy "Editors delete %1$s" on public.%1$I for delete to authenticated
         using ((select public.can_manage(%2$L)))', rec.tbl, rec.area);
  end loop;
end;
$$;

-- Product categories (no publish flag)
create policy "Public reads product categories" on public.product_categories
  for select to anon, authenticated using (true);
create policy "Product editors write categories" on public.product_categories
  for all to authenticated
  using ((select public.can_manage('products'))) with check ((select public.can_manage('products')));

-- Site settings
create policy "Public reads site settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "Primary admin updates site settings" on public.site_settings
  for update to authenticated
  using ((select public.can_manage('settings'))) with check ((select public.can_manage('settings')));

-- ---------------------------------------------------------------------------
-- Staff profiles
-- ---------------------------------------------------------------------------
create policy "Staff read staff directory" on public.staff_profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_staff()));
create policy "Primary admin manages staff" on public.staff_profiles
  for all to authenticated
  using ((select public.can_manage('staff'))) with check ((select public.can_manage('staff')));

-- ---------------------------------------------------------------------------
-- Inquiries (public writes go through submit_inquiry RPC only)
-- ---------------------------------------------------------------------------
create policy "Staff read inquiries in their department" on public.inquiries
  for select to authenticated using ((select public.inquiry_visible(type)));
create policy "Staff log inquiries in their department" on public.inquiries
  for insert to authenticated with check ((select public.inquiry_visible(type)) and source = 'staff');
create policy "Staff update inquiries in their department" on public.inquiries
  for update to authenticated
  using ((select public.inquiry_visible(type))) with check ((select public.inquiry_visible(type)));
create policy "Primary admin deletes inquiries" on public.inquiries
  for delete to authenticated using ((select public.can_manage('settings')));

create policy "Staff read activity on visible inquiries" on public.inquiry_activity
  for select to authenticated
  using (exists (select 1 from public.inquiries i where i.id = inquiry_id));
create policy "Staff add notes on visible inquiries" on public.inquiry_activity
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.inquiries i where i.id = inquiry_id)
  );

-- ---------------------------------------------------------------------------
-- Facility bookings (private; the public sees get_facility_availability() only)
-- ---------------------------------------------------------------------------
create policy "Staff read bookings" on public.facility_bookings
  for select to authenticated using ((select public.can_manage('bookings_read')));
create policy "Hospitality manages bookings" on public.facility_bookings
  for all to authenticated
  using ((select public.can_manage('bookings'))) with check ((select public.can_manage('bookings')));
