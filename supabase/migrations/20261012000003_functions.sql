-- Watakatifu Wote Senta: business functions, workflow triggers, realtime

-- ---------------------------------------------------------------------------
-- Inquiry reference codes: WWS-2026-00001
-- ---------------------------------------------------------------------------
create or replace function public.assign_inquiry_reference()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.reference_code := 'WWS-' || to_char(now() at time zone 'Africa/Nairobi', 'YYYY') || '-'
    || lpad(nextval('public.inquiry_reference_seq')::text, 5, '0');
  return new;
end;
$$;

create trigger inquiries_assign_reference
  before insert on public.inquiries
  for each row execute function public.assign_inquiry_reference();

-- ---------------------------------------------------------------------------
-- Inquiry workflow: responded_at + activity timeline
-- ---------------------------------------------------------------------------
create or replace function public.inquiry_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'Responded' and old.status <> 'Responded' and new.responded_at is null then
    new.responded_at := now();
  end if;
  return new;
end;
$$;

create trigger inquiries_before_update
  before update on public.inquiries
  for each row execute function public.inquiry_before_update();

create or replace function public.inquiry_log_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select id from public.staff_profiles where id = auth.uid());
begin
  if new.status is distinct from old.status then
    insert into public.inquiry_activity (inquiry_id, author_id, kind, from_status, to_status)
    values (new.id, actor, 'status_change', old.status, new.status);
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into public.inquiry_activity (inquiry_id, author_id, kind, body)
    values (
      new.id, actor, 'assignment',
      coalesce((select full_name from public.staff_profiles where id = new.assigned_to), 'Unassigned')
    );
  end if;
  return new;
end;
$$;

create trigger inquiries_log_activity
  after update on public.inquiries
  for each row execute function public.inquiry_log_activity();

-- ---------------------------------------------------------------------------
-- Public inquiry submission (the only way anon can create an inquiry)
-- ---------------------------------------------------------------------------
create or replace function public.submit_inquiry(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type public.inquiry_type;
  v_email text := lower(trim(payload ->> 'email'));
  v_phone text := trim(payload ->> 'phone');
  v_phone_digits text := regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9]', '', 'g');
  v_today date := (now() at time zone 'Africa/Nairobi')::date;
  v_facility public.facilities;
  v_row public.inquiries;
  v_recent int;
  v_constraint text;
begin
  -- Honeypot: real visitors never fill the hidden "website" field.
  if coalesce(payload ->> 'website', '') <> '' then
    raise exception 'Submission rejected.' using errcode = 'P0001';
  end if;

  begin
    v_type := (payload ->> 'type')::public.inquiry_type;
  exception when others then
    raise exception 'Please choose an inquiry type.' using errcode = 'P0001';
  end;

  if coalesce(trim(payload ->> 'full_name'), '') = '' then
    raise exception 'Please enter your full name.' using errcode = 'P0001';
  end if;
  if v_email is null or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.' using errcode = 'P0001';
  end if;
  if v_phone_digits !~ '^[0-9]{9,15}$' then
    raise exception 'Please enter a valid phone number.' using errcode = 'P0001';
  end if;

  -- Rate limit: at most 5 inquiries per email or phone per hour.
  select count(*) into v_recent
  from public.inquiries
  where created_at > now() - interval '1 hour'
    and (lower(email) = v_email or regexp_replace(phone, '[^0-9]', '', 'g') = v_phone_digits);
  if v_recent >= 5 then
    raise exception 'You have sent several inquiries in the last hour. Please call or WhatsApp us instead.'
      using errcode = 'P0001';
  end if;

  begin
    insert into public.inquiries (
      type, full_name, phone, email, organization, subject, message,
      facility_id, accommodation_id, catering_service_id, retreat_id, formation_id, event_id, product_id,
      event_date, time_slot, start_time, end_time, attendees_count, seating_arrangement, additional_requirements,
      check_in_date, check_out_date, guests_count, event_nature, retreat_format, preferred_date,
      participants_count, product_quantity, source, user_agent
    ) values (
      v_type,
      trim(payload ->> 'full_name'),
      v_phone,
      v_email,
      nullif(trim(payload ->> 'organization'), ''),
      nullif(trim(payload ->> 'subject'), ''),
      coalesce(trim(payload ->> 'message'), ''),
      nullif(payload ->> 'facility_id', '')::uuid,
      nullif(payload ->> 'accommodation_id', '')::uuid,
      nullif(payload ->> 'catering_service_id', '')::uuid,
      nullif(payload ->> 'retreat_id', '')::uuid,
      nullif(payload ->> 'formation_id', '')::uuid,
      nullif(payload ->> 'event_id', '')::uuid,
      nullif(payload ->> 'product_id', '')::uuid,
      nullif(payload ->> 'event_date', '')::date,
      nullif(payload ->> 'time_slot', '')::public.time_slot,
      nullif(payload ->> 'start_time', '')::time,
      nullif(payload ->> 'end_time', '')::time,
      nullif(payload ->> 'attendees_count', '')::int,
      nullif(trim(payload ->> 'seating_arrangement'), ''),
      nullif(trim(payload ->> 'additional_requirements'), ''),
      nullif(payload ->> 'check_in_date', '')::date,
      nullif(payload ->> 'check_out_date', '')::date,
      nullif(payload ->> 'guests_count', '')::int,
      nullif(trim(payload ->> 'event_nature'), ''),
      nullif(payload ->> 'retreat_format', ''),
      nullif(payload ->> 'preferred_date', '')::date,
      nullif(payload ->> 'participants_count', '')::int,
      nullif(payload ->> 'product_quantity', '')::int,
      case when payload ->> 'source' in ('web', 'modal', 'contact') then payload ->> 'source' else 'web' end,
      left(payload ->> 'user_agent', 400)
    )
    returning * into v_row;
  exception
    when invalid_text_representation or invalid_datetime_format or datetime_field_overflow
      or numeric_value_out_of_range then
      raise exception 'Some of the details entered are not valid. Please check dates, times and numbers.'
        using errcode = 'P0001';
    when check_violation then
      get stacked diagnostics v_constraint = constraint_name;
      raise exception '%', case
          when v_constraint = 'inquiries_stay_range' then 'Check-out date must be on or after the check-in date.'
          when v_constraint = 'inquiries_time_range' then 'End time must be later than start time.'
          when v_constraint like 'inquiries_full_name%' then 'Please enter your full name (2–120 characters).'
          when v_constraint like 'inquiries_phone%' then 'Please enter a valid phone number.'
          when v_constraint like 'inquiries_email%' then 'Please enter a valid email address.'
          when v_constraint like '%count%' or v_constraint like '%quantity%' then 'Please enter a realistic number of people or items.'
          else 'Some of the details entered are too long or not valid. Please review the form.'
        end using errcode = 'P0001';
    when foreign_key_violation then
      raise exception 'The selected item is no longer available. Please refresh the page and try again.'
        using errcode = 'P0001';
  end;

  -- Type-specific rules
  if v_type = 'conference' then
    if v_row.facility_id is null or v_row.event_date is null then
      raise exception 'Please choose a conference hall and an event date.' using errcode = 'P0001';
    end if;
    select * into v_facility from public.facilities where id = v_row.facility_id and is_published;
    if not found then
      raise exception 'The selected hall is not available for booking.' using errcode = 'P0001';
    end if;
    if v_row.attendees_count is not null and v_row.attendees_count > v_facility.capacity_max then
      raise exception '% holds up to % people. Please choose a larger hall or reduce the number of attendees.',
        v_facility.name, v_facility.capacity_max using errcode = 'P0001';
    end if;
  elsif v_type = 'accommodation' then
    if v_row.check_in_date is null or v_row.check_out_date is null then
      raise exception 'Please choose check-in and check-out dates.' using errcode = 'P0001';
    end if;
  elsif v_type = 'formation' and v_row.formation_id is null then
    raise exception 'Please choose a formation programme.' using errcode = 'P0001';
  elsif v_type = 'event' and v_row.event_id is null then
    raise exception 'Please choose an event.' using errcode = 'P0001';
  elsif v_type = 'product' and v_row.product_id is null and v_row.subject is null then
    raise exception 'Please choose a product.' using errcode = 'P0001';
  elsif v_type = 'general' and v_row.subject is null then
    raise exception 'Please enter a subject.' using errcode = 'P0001';
  end if;

  if least(v_row.event_date, v_row.check_in_date, v_row.preferred_date) < v_today then
    raise exception 'Dates cannot be in the past.' using errcode = 'P0001';
  end if;

  return jsonb_build_object('reference_code', v_row.reference_code, 'id', v_row.id);
end;
$$;

revoke execute on function public.submit_inquiry(jsonb) from public;
grant execute on function public.submit_inquiry(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Public availability: status only, never client names or notes
-- ---------------------------------------------------------------------------
create or replace function public.get_facility_availability(p_from date, p_to date)
returns table (
  facility_id uuid,
  booking_date date,
  time_slot public.time_slot,
  status public.availability_status
)
language sql
stable
security definer
set search_path = ''
as $$
  select b.facility_id, b.booking_date, b.time_slot, b.status
  from public.facility_bookings b
  join public.facilities f on f.id = b.facility_id and f.is_published
  where b.booking_date between p_from and least(p_to, p_from + 366)
  order by b.booking_date, b.facility_id, b.time_slot
$$;

revoke execute on function public.get_facility_availability(date, date) from public;
grant execute on function public.get_facility_availability(date, date) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Staff: turn an inquiry into a hall booking (RLS on facility_bookings applies)
-- ---------------------------------------------------------------------------
create or replace function public.convert_inquiry_to_booking(
  p_inquiry_id uuid,
  p_facility_id uuid,
  p_booking_date date,
  p_time_slot public.time_slot default 'FULL_DAY',
  p_status public.availability_status default 'PENDING'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inq public.inquiries;
  v_booking_id uuid;
begin
  select * into v_inq from public.inquiries where id = p_inquiry_id;
  if not found then
    raise exception 'Inquiry not found or not accessible.' using errcode = 'P0001';
  end if;

  insert into public.facility_bookings (
    facility_id, booking_date, time_slot, status, client_name, contact_phone, contact_email,
    internal_note, inquiry_id, created_by
  ) values (
    p_facility_id, p_booking_date, p_time_slot, p_status,
    coalesce(v_inq.organization, v_inq.full_name), v_inq.phone, v_inq.email,
    'From inquiry ' || v_inq.reference_code, v_inq.id, auth.uid()
  )
  returning id into v_booking_id;

  insert into public.inquiry_activity (inquiry_id, author_id, kind, body)
  values (v_inq.id, auth.uid(), 'booking_created',
          format('%s booking created for %s (%s)', p_status, p_booking_date, p_time_slot));

  if v_inq.status = 'New' then
    update public.inquiries set status = 'In Progress' where id = v_inq.id;
  end if;

  return v_booking_id;
end;
$$;

revoke execute on function public.convert_inquiry_to_booking(uuid, uuid, date, public.time_slot, public.availability_status) from public, anon;
grant execute on function public.convert_inquiry_to_booking(uuid, uuid, date, public.time_slot, public.availability_status) to authenticated;

-- Trigger-only functions must not be callable through the API.
revoke execute on function public.assign_inquiry_reference(), public.inquiry_before_update(),
  public.inquiry_log_activity(), public.check_booking_conflict(), public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Realtime for the staff portal (RLS still applies to subscribers)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.inquiries, public.inquiry_activity, public.facility_bookings;
  end if;
end;
$$;
