-- Durable media ownership and cleanup support for the CMS.
--
-- Content rows keep the primary media references. `post_media` additionally
-- tracks BHUMI Storage URLs embedded in rich-text article HTML, so deleting a
-- project or article cannot accidentally leave a broken image elsewhere.

begin;

create table public.post_media (
  post_id uuid not null references public.posts (id) on delete cascade,
  image_path text not null check (
    image_path ~ '^[A-Za-z0-9][A-Za-z0-9._/-]*$'
  ),
  created_at timestamptz not null default now(),
  primary key (post_id, image_path)
);

create index post_media_image_path_idx on public.post_media (image_path);

alter table public.post_media enable row level security;
revoke all on table public.post_media from anon, authenticated;
grant select, insert, update, delete on table public.post_media to authenticated;

create policy "Admins manage post media"
on public.post_media for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- The editor stores only public object URLs in HTML. Keep an internal map of
-- their Storage object paths automatically, including rows written outside the
-- Next.js app by a trusted administrative client.
create or replace function public.sync_post_media_references()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.post_media where post_id = new.id;

  insert into public.post_media (post_id, image_path)
  select distinct new.id, match[1]
  from pg_catalog.regexp_matches(
    coalesce(new.content, ''),
    '/storage/v1/object/public/media/([A-Za-z0-9][A-Za-z0-9._/-]*)',
    'g'
  ) as match
  on conflict (post_id, image_path) do nothing;

  return null;
end;
$$;

revoke all on function public.sync_post_media_references() from public;

drop trigger if exists posts_sync_media_references on public.posts;
create trigger posts_sync_media_references
after insert or update of content on public.posts
for each row execute function public.sync_post_media_references();

-- Backfill existing articles before the trigger is relied on for cleanup.
insert into public.post_media (post_id, image_path)
select distinct post.id, match[1]
from public.posts post
cross join lateral pg_catalog.regexp_matches(
  coalesce(post.content, ''),
  '/storage/v1/object/public/media/([A-Za-z0-9][A-Za-z0-9._/-]*)',
  'g'
) as match
on conflict (post_id, image_path) do nothing;

-- Failed Storage removals are retained for a later retry instead of being
-- silently lost after their database record has already been removed.
create table public.media_cleanup_queue (
  path text primary key check (
    path ~ '^[A-Za-z0-9][A-Za-z0-9._/-]*$'
  ),
  eligible_after timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index media_cleanup_queue_eligible_after_idx
  on public.media_cleanup_queue (eligible_after asc);

create trigger media_cleanup_queue_set_updated_at
before update on public.media_cleanup_queue
for each row execute function public.set_updated_at();

alter table public.media_cleanup_queue enable row level security;
revoke all on table public.media_cleanup_queue from anon, authenticated;
grant select, insert, update, delete on table public.media_cleanup_queue to authenticated;

create policy "Admins manage media cleanup queue"
on public.media_cleanup_queue for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

commit;
