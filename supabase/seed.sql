-- Seed only facts supplied for Bhumi Design & Construction. Do not add sample
-- services, contact details, project facts, imagery, metrics, or credentials.

insert into public.site_settings (
  company_name,
  short_name,
  location
)
values (
  'BHUMI DESIGN & CONSTRUCTION PVT. LTD.',
  'BHUMI',
  'Tulsipur, Dang, Nepal'
)
on conflict (settings_key) do update
set
  company_name = excluded.company_name,
  short_name = excluded.short_name,
  location = excluded.location,
  updated_at = now();

-- The supplied brief names Murkuti Substation, but no project facts were
-- included in the workspace. Keep it private and intentionally incomplete
-- until an administrator enters portfolio-supported details.
insert into public.projects (title, slug, status)
values ('Murkuti Substation', 'murkuti-substation', 'draft')
on conflict do nothing;

-- Create an admin after creating the account in Supabase Auth:
-- update public.profiles set is_admin = true where id = '<auth-user-uuid>';
