-- Bhumi Design & Construction: initial content schema, access policies, and media bucket.
-- This migration intentionally stores Storage object paths (not public URLs) in content rows.

create extension if not exists "pgcrypto";

create type public.content_status as enum ('draft', 'published');
create type public.contact_message_status as enum ('new', 'read', 'archived');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_path text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (
    full_name is null or char_length(btrim(full_name)) between 1 and 160
  )
);

-- A singleton row holds all company-wide editable content. `settings_key` prevents
-- accidental creation of multiple site-setting records while retaining a UUID key.
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  settings_key text not null default 'default' unique check (settings_key = 'default'),
  company_name text not null,
  short_name text,
  tagline text,
  description text,
  location text,
  about_title text,
  about_content text,
  address text,
  phone text,
  email text,
  logo_path text,
  hero_title text,
  hero_description text,
  hero_image_path text,
  about_image_path text,
  social_links jsonb not null default '{}'::jsonb,
  default_seo_title text,
  default_seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_company_name_not_blank check (char_length(btrim(company_name)) > 0),
  constraint site_settings_email_length check (email is null or char_length(email) <= 254)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  category text,
  location text,
  client text,
  main_contractor text,
  financing text,
  description text,
  scope_of_work text,
  execution_details text,
  -- `status` controls website publication. `project_status` is the optional
  -- real-world execution label (for example, a portfolio-supported label).
  project_status text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  start_date date,
  completion_date date,
  manpower integer,
  featured boolean not null default false,
  cover_image_path text,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_title_not_blank check (char_length(btrim(title)) > 0),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_manpower_non_negative check (manpower is null or manpower >= 0),
  constraint projects_sort_order_non_negative check (sort_order >= 0),
  constraint projects_date_order check (
    start_date is null or completion_date is null or start_date <= completion_date
  )
);

create unique index projects_slug_lower_unique_idx on public.projects (lower(slug));
create index projects_public_listing_idx
  on public.projects (status, featured desc, sort_order asc, published_at desc);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  image_path text not null,
  caption text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_images_path_not_blank check (char_length(btrim(image_path)) > 0),
  constraint project_images_sort_order_non_negative check (sort_order >= 0)
);

create index project_images_project_sort_idx
  on public.project_images (project_id, sort_order asc, created_at asc);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  short_description text,
  description text,
  cover_image_path text,
  icon text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_title_not_blank check (char_length(btrim(title)) > 0),
  constraint services_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint services_sort_order_non_negative check (sort_order >= 0)
);

create unique index services_slug_lower_unique_idx on public.services (lower(slug));
create index services_public_listing_idx
  on public.services (status, featured desc, sort_order asc, published_at desc);

create table public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  description text,
  cover_image_path text,
  category text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_albums_title_not_blank check (char_length(btrim(title)) > 0),
  constraint gallery_albums_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint gallery_albums_sort_order_non_negative check (sort_order >= 0)
);

create unique index gallery_albums_slug_lower_unique_idx on public.gallery_albums (lower(slug));
create index gallery_albums_public_listing_idx
  on public.gallery_albums (status, featured desc, sort_order asc, published_at desc);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums (id) on delete cascade,
  image_path text not null,
  caption text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_images_path_not_blank check (char_length(btrim(image_path)) > 0),
  constraint gallery_images_sort_order_non_negative check (sort_order >= 0)
);

create index gallery_images_album_sort_idx
  on public.gallery_images (album_id, sort_order asc, created_at asc);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text,
  cover_image_path text,
  content text,
  category text,
  tags text[] not null default '{}',
  author text,
  author_id uuid references public.profiles (id) on delete set null,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_not_blank check (char_length(btrim(title)) > 0),
  constraint posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint posts_author_length check (author is null or char_length(author) <= 160)
);

create unique index posts_slug_lower_unique_idx on public.posts (lower(slug));
create index posts_public_listing_idx
  on public.posts (status, published_at desc, created_at desc);
create index posts_tags_idx on public.posts using gin (tags);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status public.contact_message_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_messages_name_not_blank check (char_length(btrim(name)) > 0),
  constraint contact_messages_name_length check (char_length(name) <= 120),
  constraint contact_messages_email_not_blank check (char_length(btrim(email)) > 3),
  constraint contact_messages_email_length check (char_length(email) <= 254),
  constraint contact_messages_phone_length check (phone is null or char_length(phone) <= 50),
  constraint contact_messages_subject_not_blank check (char_length(btrim(subject)) > 0),
  constraint contact_messages_subject_length check (char_length(subject) <= 200),
  constraint contact_messages_message_not_blank check (char_length(btrim(message)) > 0),
  constraint contact_messages_message_length check (char_length(message) <= 10000)
);

create index contact_messages_admin_listing_idx
  on public.contact_messages (status, created_at desc);

-- Shared trigger helpers ----------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_content_published_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'published'::public.content_status and new.published_at is null then
    new.published_at = now();
  elsif new.status = 'draft'::public.content_status then
    new.published_at = null;
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger project_images_set_updated_at
before update on public.project_images
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create trigger gallery_albums_set_updated_at
before update on public.gallery_albums
for each row execute function public.set_updated_at();

create trigger gallery_images_set_updated_at
before update on public.gallery_images
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

create trigger projects_set_published_at
before insert or update of status, published_at on public.projects
for each row execute function public.set_content_published_at();

create trigger services_set_published_at
before insert or update of status, published_at on public.services
for each row execute function public.set_content_published_at();

create trigger gallery_albums_set_published_at
before insert or update of status, published_at on public.gallery_albums
for each row execute function public.set_content_published_at();

create trigger posts_set_published_at
before insert or update of status, published_at on public.posts
for each row execute function public.set_content_published_at();

-- Auth users get a non-privileged profile. Promoting a profile to admin is a
-- deliberate one-time server-side/database operation, never a client action.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- `is_admin` is intentionally the only application role check. Keeping it in
-- one security-definer function makes the RLS policy surface auditable.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Row-level security --------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.services enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.posts enable row level security;
alter table public.contact_messages enable row level security;

-- RLS determines which rows are reachable; these grants provide only the
-- minimum table-level capabilities needed by the Supabase API roles.
grant usage on schema public to anon, authenticated;
grant usage on type public.content_status, public.contact_message_status to anon, authenticated;

grant select on table
  public.profiles,
  public.site_settings,
  public.projects,
  public.project_images,
  public.services,
  public.gallery_albums,
  public.gallery_images,
  public.posts
to anon;
grant insert on table public.contact_messages to anon;

grant select, insert, update, delete on table
  public.profiles,
  public.site_settings,
  public.projects,
  public.project_images,
  public.services,
  public.gallery_albums,
  public.gallery_images,
  public.posts,
  public.contact_messages
to authenticated;

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "Admins manage profiles"
on public.profiles for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Site settings are publicly readable"
on public.site_settings for select
to anon, authenticated
using (true);

create policy "Admins insert site settings"
on public.site_settings for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins update site settings"
on public.site_settings for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published projects are publicly readable"
on public.projects for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and published_at is not null
  and published_at <= now()
);

create policy "Admins manage projects"
on public.projects for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published project images are publicly readable"
on public.project_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_images.project_id
      and p.status = 'published'::public.content_status
      and p.published_at is not null
      and p.published_at <= now()
  )
);

create policy "Admins manage project images"
on public.project_images for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published services are publicly readable"
on public.services for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and published_at is not null
  and published_at <= now()
);

create policy "Admins manage services"
on public.services for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published gallery albums are publicly readable"
on public.gallery_albums for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and published_at is not null
  and published_at <= now()
);

create policy "Admins manage gallery albums"
on public.gallery_albums for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published gallery images are publicly readable"
on public.gallery_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.gallery_albums a
    where a.id = gallery_images.album_id
      and a.status = 'published'::public.content_status
      and a.published_at is not null
      and a.published_at <= now()
  )
);

create policy "Admins manage gallery images"
on public.gallery_images for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Published posts are publicly readable"
on public.posts for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and published_at is not null
  and published_at <= now()
);

create policy "Admins manage posts"
on public.posts for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Anyone can submit a new contact message"
on public.contact_messages for insert
to anon, authenticated
with check (status = 'new'::public.contact_message_status);

create policy "Admins manage contact messages"
on public.contact_messages for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Storage -------------------------------------------------------------------
-- `media` is public so Next.js can serve optimized portfolio imagery directly.
-- Object keys must remain opaque; CMS records keep the authoritative references.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']::text[]
)
on conflict (id) do nothing;

create policy "Public can view Bhumi media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'media');

create policy "Admins can upload Bhumi media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can update Bhumi media"
on storage.objects for update
to authenticated
using (bucket_id = 'media' and (select public.is_admin()))
with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can delete Bhumi media"
on storage.objects for delete
to authenticated
using (bucket_id = 'media' and (select public.is_admin()));
