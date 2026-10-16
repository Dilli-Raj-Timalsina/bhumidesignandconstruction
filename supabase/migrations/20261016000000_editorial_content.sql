-- Administrator-editable homepage, About, contact, and shared call-to-action copy.
-- Existing rows keep their current public copy until an administrator saves edits.
alter table public.site_settings
  add column if not exists editorial_content jsonb not null default '{}'::jsonb,
  add column if not exists highlights_image_path text default '/images/marketing/rebar-background.jpg',
  add column if not exists hero_image_alt text,
  add column if not exists about_image_alt text;
