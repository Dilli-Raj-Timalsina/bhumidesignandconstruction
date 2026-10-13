-- A saved null hides a page intro field; an absent key keeps its original copy.
alter table public.site_settings
  add column if not exists page_intros jsonb not null default '{}'::jsonb;
