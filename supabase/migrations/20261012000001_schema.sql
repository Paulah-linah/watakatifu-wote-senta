-- Watakatifu Wote Senta: core schema (enums, tables, constraints, indexes)

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('primary_admin', 'hospitality_editor', 'ministry_editor', 'products_editor');
create type public.availability_status as enum ('PENDING', 'BOOKED', 'BLOCKED');
create type public.time_slot as enum ('FULL_DAY', 'MORNING', 'AFTERNOON', 'EVENING');
create type public.inquiry_type as enum ('conference', 'accommodation', 'catering', 'retreat', 'formation', 'product', 'event', 'general');
create type public.inquiry_status as enum ('New', 'In Progress', 'Responded', 'Completed', 'Cancelled');
create type public.retreat_category as enum ('individual', 'group', 'seminar', 'youth', 'clergy');
create type public.gallery_category as enum ('Facilities', 'Accommodation', 'Catering', 'Catholic Ministry', 'Events', 'Grounds');
create type public.inquiry_activity_kind as enum ('note', 'status_change', 'assignment', 'booking_created');

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity & configuration
-- ---------------------------------------------------------------------------
create table public.staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  title text,
  role public.staff_role not null,
  email text not null unique,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  name text not null,
  short_name text not null default 'Watakatifu Wote Senta',
  diocese text not null,
  location text not null,
  address text not null,
  phone text not null,               -- E.164, used for tel: links
  phone_display text not null,
  whatsapp_number text not null,     -- digits only, used for wa.me links
  whatsapp_message text not null default 'Hello Watakatifu Wote Senta, I would like to make an inquiry.',
  email text not null,
  daily_mass_time text not null default '7:00 AM',
  office_hours text not null default 'Mon–Sat, 8:00 AM – 5:00 PM',
  founded_on date,
  mission text,
  vision text,
  philosophy text,
  core_values jsonb not null default '[]'::jsonb,
  map_embed_url text,
  map_link_url text,
  social jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Hospitality
-- ---------------------------------------------------------------------------
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  capacity_min int not null check (capacity_min > 0),
  capacity_max int not null,
  price_kes numeric(10, 2) check (price_kes >= 0),
  price_note text,
  description text not null default '',
  features text[] not null default '{}',
  seating_styles text[] not null default '{}',
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facilities_capacity_range check (capacity_min <= capacity_max)
);

create table public.accommodation_options (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  category text not null default '',
  capacity_desc text not null default '',
  rooms_count int check (rooms_count >= 0),
  price_estimate text,
  description text not null default '',
  amenities text[] not null default '{}',
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.catering_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  ideal_for text not null default '',
  includes text[] not null default '{}',
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.laundry_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  turnaround_time text not null default '',
  notes text not null default '',
  is_available boolean not null default true,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Catholic ministry & events
-- ---------------------------------------------------------------------------
create table public.mass_schedules (
  id uuid primary key default gen_random_uuid(),
  day_label text not null,
  time_label text not null,
  celebration_type text not null,
  description text not null default '',
  location text not null default '',
  is_special boolean not null default false,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.retreats (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  category public.retreat_category not null,
  target_audience text not null default '',
  description text not null default '',
  start_date date,
  end_date date,
  duration text not null default '',
  requirements text[] not null default '{}',
  fee_kes numeric(10, 2) check (fee_kes >= 0),
  fee_note text,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retreats_date_range check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.formation_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  duration text not null default '',
  schedule text,
  requirements text[] not null default '{}',
  fee_kes numeric(10, 2) check (fee_kes >= 0),
  fee_note text,
  image_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  description text not null default '',
  event_date date not null,
  start_time time,
  end_time time,
  time_label text,
  location text not null default '',
  image_url text,
  registration_open boolean not null default true,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_range check (end_time is null or start_time is null or end_time > start_time)
);
create index events_date_idx on public.events (event_date);

-- ---------------------------------------------------------------------------
-- Catalogue & media
-- ---------------------------------------------------------------------------
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid not null references public.product_categories (id) on delete restrict,
  description text not null default '',
  price_kes numeric(10, 2) check (price_kes >= 0),
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category public.gallery_category not null,
  image_url text not null,
  caption text not null default '',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Inquiries
-- ---------------------------------------------------------------------------
create sequence public.inquiry_reference_seq;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  type public.inquiry_type not null,
  status public.inquiry_status not null default 'New',

  -- Contact
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (regexp_replace(phone, '[^0-9]', '', 'g') ~ '^[0-9]{9,15}$'),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  organization text check (char_length(organization) <= 160),
  subject text check (char_length(subject) <= 200),
  message text not null default '' check (char_length(message) <= 4000),

  -- Linked records
  facility_id uuid references public.facilities (id) on delete set null,
  accommodation_id uuid references public.accommodation_options (id) on delete set null,
  catering_service_id uuid references public.catering_services (id) on delete set null,
  retreat_id uuid references public.retreats (id) on delete set null,
  formation_id uuid references public.formation_programs (id) on delete set null,
  event_id uuid references public.events (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,

  -- Type-specific details
  event_date date,
  time_slot public.time_slot,
  start_time time,
  end_time time,
  attendees_count int check (attendees_count > 0 and attendees_count <= 2000),
  seating_arrangement text check (char_length(seating_arrangement) <= 60),
  additional_requirements text check (char_length(additional_requirements) <= 1000),
  check_in_date date,
  check_out_date date,
  guests_count int check (guests_count > 0 and guests_count <= 500),
  event_nature text check (char_length(event_nature) <= 200),
  retreat_format text check (retreat_format in ('Individual', 'Group')),
  preferred_date date,
  participants_count int check (participants_count > 0 and participants_count <= 2000),
  product_quantity int check (product_quantity > 0 and product_quantity <= 10000),

  -- Workflow
  assigned_to uuid references public.staff_profiles (id) on delete set null,
  responded_at timestamptz,
  source text not null default 'web' check (source in ('web', 'modal', 'contact', 'staff')),
  user_agent text check (char_length(user_agent) <= 400),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint inquiries_stay_range check (check_out_date is null or check_in_date is null or check_out_date >= check_in_date),
  constraint inquiries_time_range check (end_time is null or start_time is null or end_time > start_time)
);
create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index inquiries_type_idx on public.inquiries (type);
create index inquiries_email_created_idx on public.inquiries (lower(email), created_at desc);
create index inquiries_assigned_idx on public.inquiries (assigned_to);

create table public.inquiry_activity (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_id uuid references public.staff_profiles (id) on delete set null,
  kind public.inquiry_activity_kind not null,
  body text check (char_length(body) <= 4000),
  from_status public.inquiry_status,
  to_status public.inquiry_status,
  created_at timestamptz not null default now()
);
create index inquiry_activity_inquiry_idx on public.inquiry_activity (inquiry_id, created_at);

-- ---------------------------------------------------------------------------
-- Facility bookings (private) — absence of a row means AVAILABLE
-- ---------------------------------------------------------------------------
create table public.facility_bookings (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  booking_date date not null,
  time_slot public.time_slot not null default 'FULL_DAY',
  status public.availability_status not null,
  client_name text,
  contact_phone text,
  contact_email text,
  public_note text check (char_length(public_note) <= 140),
  internal_note text,
  inquiry_id uuid references public.inquiries (id) on delete set null,
  created_by uuid references public.staff_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facility_bookings_slot_unique unique (facility_id, booking_date, time_slot)
);
create index facility_bookings_date_idx on public.facility_bookings (booking_date);

-- A FULL_DAY booking excludes every other slot for the same hall/date, and vice versa.
create or replace function public.check_booking_conflict()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.facility_bookings b
    where b.facility_id = new.facility_id
      and b.booking_date = new.booking_date
      and b.id <> new.id
      and (new.time_slot = 'FULL_DAY' or b.time_slot = 'FULL_DAY')
  ) then
    raise exception 'Booking conflict: % on % already has a booking that overlaps the % slot',
      new.facility_id, new.booking_date, new.time_slot
      using errcode = '23P01';
  end if;
  return new;
end;
$$;

create trigger facility_bookings_conflict
  before insert or update of facility_id, booking_date, time_slot on public.facility_bookings
  for each row execute function public.check_booking_conflict();

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'staff_profiles', 'site_settings', 'facilities', 'accommodation_options', 'catering_services',
    'laundry_services', 'mass_schedules', 'retreats', 'formation_programs', 'events',
    'product_categories', 'products', 'gallery_images', 'inquiries', 'facility_bookings'
  ] loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;
