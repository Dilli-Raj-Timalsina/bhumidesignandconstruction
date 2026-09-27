-- A single, server-configured administrator and a durable login rate limiter.
--
-- Apply after 20260927120000_admin_security_hardening.sql. The environment is
-- deliberately not readable from Postgres, so `npm run admin:sync` installs
-- the configured account into the singleton access row after this migration.

begin;

-- Only the account installed by the server-side sync command can satisfy
-- public.is_admin(). This closes the gap where an old manually promoted
-- profile could continue to use the Supabase API outside this application.
create table public.admin_access_config (
  settings_key text primary key default 'default'
    check (settings_key = 'default'),
  admin_user_id uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_access_config enable row level security;
revoke all on table public.admin_access_config from public, anon, authenticated;

create trigger admin_access_config_set_updated_at
before update on public.admin_access_config
for each row execute function public.set_updated_at();

-- A confirmed Supabase account must also be the singleton configured account.
-- This function is the policy boundary used by all existing CMS RLS policies.
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
      join public.admin_access_config c
        on c.admin_user_id = p.id
       and c.settings_key = 'default'
      where p.id = auth.uid()
        and u.email_confirmed_at is not null
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- These two RPCs are executable only with the server-side service key. They
-- avoid granting an application session any path to create or promote users.
create or replace function public.configured_admin_user_id(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u.id
  from auth.users u
  where pg_catalog.lower(u.email) = pg_catalog.lower(pg_catalog.btrim(p_email))
  limit 1;
$$;

revoke all on function public.configured_admin_user_id(text)
  from public, anon, authenticated;
grant execute on function public.configured_admin_user_id(text) to service_role;

create or replace function public.configure_configured_admin_access(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous_admin_id uuid;
begin
  if p_user_id is null then
    raise exception using errcode = '22004', message = 'admin_user_id_required';
  end if;

  -- Serialize rare concurrent syncs so a rotation cannot leave two active
  -- access rows or accidentally clear the newly selected administrator.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('bhumi-configured-admin-access')
  );

  if not exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.id = p_user_id
      and u.email_confirmed_at is not null
  ) then
    raise exception using errcode = 'P0001', message = 'admin_profile_missing';
  end if;

  select admin_user_id
  into previous_admin_id
  from public.admin_access_config
  where settings_key = 'default'
  for update;

  if found then
    update public.admin_access_config
    set admin_user_id = p_user_id
    where settings_key = 'default';
  else
    insert into public.admin_access_config (settings_key, admin_user_id)
    values ('default', p_user_id);
  end if;

  update public.profiles
  set is_admin = true
  where id = p_user_id;

  if previous_admin_id is not null and previous_admin_id <> p_user_id then
    update public.profiles
    set is_admin = false
    where id = previous_admin_id;
  end if;
end;
$$;

revoke all on function public.configure_configured_admin_access(uuid)
  from public, anon, authenticated;
grant execute on function public.configure_configured_admin_access(uuid)
  to service_role;

-- The table stores only HMAC-SHA-256 digests generated in the server action;
-- no raw email address or client IP is persisted. There are no API grants or
-- policies for browser roles.
create table public.admin_login_rate_limits (
  subject_key text primary key check (
    subject_key ~ '^(ip|account):[0-9a-f]{64}$'
  ),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now(),
  check (locked_until is null or locked_until >= window_started_at)
);

create index admin_login_rate_limits_cleanup_idx
  on public.admin_login_rate_limits (updated_at asc);

alter table public.admin_login_rate_limits enable row level security;
revoke all on table public.admin_login_rate_limits from public, anon, authenticated;

-- Atomically consume an attempt for one IP key and, when the submitted login
-- ID is the configured administrator, one global account key. This means a
-- rotating-IP attack still reaches the account lock, while unknown IDs cannot
-- fill the table with arbitrary address-derived records.
create or replace function public.consume_admin_login_attempt(p_subjects text[])
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  subject text;
  limiter public.admin_login_rate_limits%rowtype;
  maximum_attempts integer;
  attempted_at timestamptz := pg_catalog.clock_timestamp();
  retry_seconds integer := 0;
begin
  if p_subjects is null
    or pg_catalog.cardinality(p_subjects) < 1
    or pg_catalog.cardinality(p_subjects) > 2
  then
    return query select false, 900;
    return;
  end if;

  if (
    select count(*)
    from pg_catalog.unnest(p_subjects) as requested(subject_key)
    where subject_key ~ '^(ip|account):[0-9a-f]{64}$'
  ) <> pg_catalog.cardinality(p_subjects)
  or (
    select count(*)
    from pg_catalog.unnest(p_subjects) as requested(subject_key)
    where subject_key like 'ip:%'
  ) <> 1
  or (
    select count(*)
    from pg_catalog.unnest(p_subjects) as requested(subject_key)
    where subject_key like 'account:%'
  ) > 1
  then
    return query select false, 900;
    return;
  end if;

  -- Lock in a stable order, so parallel requests observe the same counters
  -- without deadlocking each other.
  for subject in
    select distinct subject_key
    from pg_catalog.unnest(p_subjects) as requested(subject_key)
    order by subject_key
  loop
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(subject));
  end loop;

  -- Bounded opportunistic cleanup keeps the durable table from growing with
  -- abandoned, hash-only IP buckets while keeping the login path predictable.
  delete from public.admin_login_rate_limits
  where subject_key in (
    select subject_key
    from public.admin_login_rate_limits
    where updated_at < attempted_at - interval '1 day'
      and (locked_until is null or locked_until < attempted_at)
    order by updated_at asc
    limit 100
  )
    and subject_key <> all(p_subjects);

  select coalesce(
    max(
      greatest(
        1,
        ceil(extract(epoch from locked_until - attempted_at))::integer
      )
    ),
    0
  )
  into retry_seconds
  from public.admin_login_rate_limits
  where subject_key = any(p_subjects)
    and locked_until > attempted_at;

  if retry_seconds > 0 then
    return query select false, retry_seconds;
    return;
  end if;

  -- First determine whether this request reaches a limit. If it does, do not
  -- increment any other bucket; lock the exhausted bucket for 15 minutes.
  for subject in
    select distinct subject_key
    from pg_catalog.unnest(p_subjects) as requested(subject_key)
    order by subject_key
  loop
    maximum_attempts := case
      when subject like 'ip:%' then 5
      else 10
    end;

    select *
    into limiter
    from public.admin_login_rate_limits
    where subject_key = subject;

    if found
      and limiter.window_started_at > attempted_at - interval '15 minutes'
      and limiter.attempt_count >= maximum_attempts
    then
      update public.admin_login_rate_limits
      set locked_until = attempted_at + interval '15 minutes',
          updated_at = attempted_at
      where subject_key = subject;

      return query select false, 900;
      return;
    end if;
  end loop;

  -- This is a permitted attempt. Record it for every applicable subject.
  for subject in
    select distinct subject_key
    from pg_catalog.unnest(p_subjects) as requested(subject_key)
    order by subject_key
  loop
    select *
    into limiter
    from public.admin_login_rate_limits
    where subject_key = subject;

    if not found then
      insert into public.admin_login_rate_limits (
        subject_key, attempt_count, window_started_at, locked_until, updated_at
      ) values (subject, 1, attempted_at, null, attempted_at);
    elsif limiter.window_started_at <= attempted_at - interval '15 minutes' then
      update public.admin_login_rate_limits
      set attempt_count = 1,
          window_started_at = attempted_at,
          locked_until = null,
          updated_at = attempted_at
      where subject_key = subject;
    else
      update public.admin_login_rate_limits
      set attempt_count = attempt_count + 1,
          locked_until = null,
          updated_at = attempted_at
      where subject_key = subject;
    end if;
  end loop;

  return query select true, 0;
end;
$$;

revoke all on function public.consume_admin_login_attempt(text[])
  from public, anon, authenticated;
grant execute on function public.consume_admin_login_attempt(text[])
  to service_role;

create or replace function public.clear_admin_login_attempts(p_subjects text[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_subjects is null or pg_catalog.cardinality(p_subjects) = 0 then
    return;
  end if;

  delete from public.admin_login_rate_limits
  where subject_key = any(p_subjects);
end;
$$;

revoke all on function public.clear_admin_login_attempts(text[])
  from public, anon, authenticated;
grant execute on function public.clear_admin_login_attempts(text[]) to service_role;

commit;
