-- Security hardening for the protected CMS and public inquiry endpoint.
-- Apply after 20260927000000_initial_schema.sql.

begin;

-- An administrator is allowed to manage content, not promote accounts. Removing
-- this write path prevents a compromised CMS session from granting itself or
-- another account administrative access through the Supabase REST API.
drop policy if exists "Admins manage profiles" on public.profiles;
revoke insert, update, delete on table public.profiles from authenticated;

-- Keep database policies aligned with the application guard: an admin must
-- have a confirmed email as well as an explicitly promoted profile.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select p.is_admin
      from public.profiles p
      join auth.users u on u.id = p.id
      where p.id = auth.uid()
        and u.email_confirmed_at is not null
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Public inquiries are accepted only by the server endpoint after validation.
-- This closes the anonymous REST insert path, which otherwise bypasses the
-- endpoint's schema and anti-abuse controls.
drop policy if exists "Anyone can submit a new contact message"
  on public.contact_messages;
revoke insert on table public.contact_messages from anon;

-- A durable, database-enforced per-email throttle complements the endpoint's
-- same-origin, body-size, honeypot, and schema checks. The advisory lock makes
-- parallel requests for the same address observe one another.
create or replace function public.limit_contact_message_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_message_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(pg_catalog.lower(new.email))
  );

  select count(*)
  into recent_message_count
  from public.contact_messages
  where pg_catalog.lower(email) = pg_catalog.lower(new.email)
    and created_at > now() - interval '15 minutes';

  if recent_message_count >= 3 then
    raise exception using
      errcode = 'P0001',
      message = 'contact_rate_limited';
  end if;

  return new;
end;
$$;

revoke all on function public.limit_contact_message_submission() from public;

drop trigger if exists contact_messages_rate_limit on public.contact_messages;
create trigger contact_messages_rate_limit
before insert on public.contact_messages
for each row execute function public.limit_contact_message_submission();

-- Preserve a tamper-resistant record of global settings changes. Inserts come
-- only from the security-definer trigger; authenticated users may read records
-- only when they satisfy the same confirmed-admin predicate.
create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(btrim(action)) between 1 and 120),
  entity_type text not null check (
    char_length(btrim(entity_type)) between 1 and 120
  ),
  entity_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_events_entity_created_idx
  on public.admin_audit_events (entity_type, created_at desc);

alter table public.admin_audit_events enable row level security;
revoke all on table public.admin_audit_events from anon, authenticated;
grant select on table public.admin_audit_events to authenticated;

drop policy if exists "Admins can read audit events"
  on public.admin_audit_events;
create policy "Admins can read audit events"
on public.admin_audit_events for select
to authenticated
using ((select public.is_admin()));

create or replace function public.audit_site_settings_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_audit_events (actor_id, action, entity_type, entity_id)
  values (
    auth.uid(),
    case
      when new.location is distinct from old.location
        or new.address is distinct from old.address
        or new.email is distinct from old.email
        or new.phone is distinct from old.phone
      then 'contact_details.updated'
      else 'site_settings.updated'
    end,
    'site_settings',
    new.id
  );
  return new;
end;
$$;

revoke all on function public.audit_site_settings_update() from public;

drop trigger if exists site_settings_audit_update on public.site_settings;
create trigger site_settings_audit_update
after update on public.site_settings
for each row execute function public.audit_site_settings_update();

commit;
