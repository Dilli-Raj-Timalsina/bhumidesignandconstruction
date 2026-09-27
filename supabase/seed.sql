-- Seed content is limited to facts and media documented in the supplied
-- Bhumi Design & Construction portfolio. It deliberately creates no posts:
-- the portfolio contains no verified editorial/insight content.

-- Company-wide settings -----------------------------------------------------

insert into public.site_settings (
  settings_key,
  company_name,
  short_name,
  tagline,
  description,
  location,
  about_title,
  about_content,
  address,
  phone,
  email,
  logo_path,
  hero_title,
  hero_description,
  hero_image_path,
  about_image_path,
  social_links,
  default_seo_title,
  default_seo_description
)
values (
  'default',
  'BHUMI DESIGN & CONSTRUCTION PVT. LTD.',
  'BHUMI',
  'Civil Engineering & Construction Solutions',
  'Bhumi Design and Construction Pvt. Ltd. is a civil engineering and construction contracting company based in Tulsipur, Dang, Nepal.',
  'Tulsipur, Dang, Nepal',
  'About Bhumi Construction',
  'Founded and led by Er. Shashiram Nakal, a civil engineering graduate of Pulchowk Campus, Institute of Engineering, Bhumi focuses on turnkey and civil contracting works for private residential clients and institutional infrastructure projects, including EIB-financed substation construction under Nepal Electricity Authority''s grid expansion program.',
  'Tulsipur, Dang, Nepal',
  '9763412459',
  'bhumiconstruction026@gmail.com',
  '/brand/bhumi-wordmark.png',
  'Built with engineering. Delivered with precision.',
  'Civil engineering and construction solutions for residential and institutional infrastructure projects in Tulsipur, Dang, Nepal.',
  '/images/portfolio/murkuti-crb-shuttering-site.png',
  '/images/portfolio/hari-pariyar-complete.jpg',
  '{}'::jsonb,
  'BHUMI Design & Construction | Civil Engineering & Construction Solutions',
  'Civil engineering and construction solutions for residential and institutional infrastructure projects in Tulsipur, Dang, Nepal.'
)
on conflict (settings_key) do update
set
  company_name = excluded.company_name,
  short_name = excluded.short_name,
  tagline = excluded.tagline,
  description = excluded.description,
  location = excluded.location,
  about_title = excluded.about_title,
  about_content = excluded.about_content,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  logo_path = excluded.logo_path,
  hero_title = excluded.hero_title,
  hero_description = excluded.hero_description,
  hero_image_path = excluded.hero_image_path,
  about_image_path = excluded.about_image_path,
  social_links = excluded.social_links,
  default_seo_title = excluded.default_seo_title,
  default_seo_description = excluded.default_seo_description;

-- Portfolio-supported services ---------------------------------------------

with seed_services (
  title,
  slug,
  short_description,
  description,
  cover_image_path,
  icon,
  featured,
  sort_order,
  status,
  published_at
) as (
  values
    (
      'Turnkey Construction',
      'turnkey-construction',
      'Turnkey and civil contracting works for private residential clients.',
      'Turnkey and civil contracting works for private residential clients.',
      '/images/portfolio/gehendra-oli-proposed-design.jpg',
      null::text,
      true,
      1,
      'published'::public.content_status,
      now()
    ),
    (
      'Civil & Structural Works',
      'civil-structural-works',
      'RCC, masonry and foundation works.',
      'Civil and structural works including RCC, masonry and foundation works.',
      '/images/portfolio/hari-pariyar-roof-complete.jpg',
      null::text,
      true,
      2,
      'published'::public.content_status,
      now()
    ),
    (
      'Substation Civil Works',
      'substation-civil-works',
      'Civil works for substation infrastructure.',
      'Civil works for substation infrastructure, including Control Room Building and Staff Quarter construction.',
      '/images/portfolio/murkuti-crb-shuttering-site.png',
      null::text,
      true,
      3,
      'published'::public.content_status,
      now()
    ),
    (
      'Design & Interior Works',
      'design-interior-works',
      'Design and interior works coordinated through vetted specialist partners and subcontractors under Bhumi''s supervision.',
      'Design and interior works are executed through vetted specialist partners and subcontractors under Bhumi''s supervision.',
      '/images/portfolio/krishna-oli-proposed-design.jpg',
      null::text,
      true,
      4,
      'published'::public.content_status,
      now()
    )
)
insert into public.services (
  title,
  slug,
  short_description,
  description,
  cover_image_path,
  icon,
  featured,
  sort_order,
  status,
  published_at
)
select
  title,
  slug,
  short_description,
  description,
  cover_image_path,
  icon,
  featured,
  sort_order,
  status,
  published_at
from seed_services
on conflict (lower(slug)) do update
set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  cover_image_path = excluded.cover_image_path,
  icon = excluded.icon,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = coalesce(services.published_at, excluded.published_at);

-- Portfolio projects --------------------------------------------------------
-- Project execution labels below are intentionally written as portfolio
-- snapshots. The supplied document uses relative/current status language and
-- B.S. dates, so no Gregorian dates or live-status claims are inferred.

with seed_projects (
  title,
  slug,
  category,
  location,
  client,
  main_contractor,
  financing,
  description,
  scope_of_work,
  execution_details,
  project_status,
  status,
  published_at,
  start_date,
  completion_date,
  manpower,
  featured,
  cover_image_path,
  sort_order
) as (
  values
    (
      'Murkuti Substation — Control Room Building & Staff Quarter',
      'murkuti-substation-control-room-and-staff-quarter',
      'Substation civil works',
      'Murkuti Substation',
      'Nepal Electricity Authority (NEA)',
      'Ethos Power – SIPS JV',
      'EIB (European Investment Bank) — DSUEP EIB-W2 Package',
      'Construction of the Control Room Building (CRB) and Staff Quarter at the 33/11 kV Murkuti Substation.',
      'Construction of the Control Room Building (CRB) and Staff Quarter, 33/11 kV Murkuti Substation.',
      'Contract signed: Asar 2083. Work commenced: Shrawan 6, 2083. Portfolio documentation notes a remote site 25 km off-road from Ghorahi and drinking water supplied by tanker. It records labour shortage, material supply constraints on the off-road access route, and two concrete castings completed within two months during monsoon season.',
      'Portfolio status as of Ashwin 4, 2083: Control Room Building and Staff Quarter casting works completed to date, approximately two months into execution.',
      'published'::public.content_status,
      now(),
      null::date,
      null::date,
      15,
      true,
      '/images/portfolio/murkuti-crb-shuttering-site.png',
      1
    ),
    (
      'Gehendra Oli — Four-Storey Residential Building',
      'gehendra-oli-four-storey-residential-building',
      'Residential / Turnkey',
      'Tulsipur Sub-Metropolitan City, Dang',
      'Gehendra Oli',
      null::text,
      null::text,
      'Four-storey residential building under a turnkey contract.',
      'Turnkey contract.',
      'Contract value: NPR 1,20,00,000 (Rs. 1.2 Crore). Construction period: 10 months. Target completion: 2084/03/15 B.S.',
      'Portfolio snapshot: foundation and RCC column works completed up to toe wall level.',
      'published'::public.content_status,
      now(),
      null::date,
      null::date,
      null::integer,
      false,
      '/images/portfolio/gehendra-oli-proposed-design.jpg',
      2
    ),
    (
      'Krishna Oli — 1.5-Storey Floor Addition',
      'krishna-oli-floor-addition',
      'Residential / Turnkey',
      'Tulsipur, Dang',
      'Krishna Oli',
      null::text,
      null::text,
      '1.5-storey floor addition under a turnkey contract.',
      'Turnkey contract — 1.5-storey floor addition.',
      'Contract value: NPR 50,00,000 (Rs. 50 Lakh). The portfolio records commencement as approximately one month before its snapshot and a 10-month construction period.',
      'Portfolio snapshot: superstructure works in progress, with roof slab shuttering underway.',
      'published'::public.content_status,
      now(),
      null::date,
      null::date,
      null::integer,
      false,
      '/images/portfolio/krishna-oli-proposed-design.jpg',
      3
    ),
    (
      'Sher Bahadur Khadka — Residential Building',
      'sher-bahadur-khadka-residential-building',
      'Residential / Turnkey',
      'Bijauri, Dang',
      'Sher Bahadur Khadka',
      null::text,
      null::text,
      'Residential building under a turnkey contract.',
      'Turnkey contract.',
      'Contract value: NPR 87,00,000 (Rs. 87 Lakh). Contract date: 2082/09/25 B.S. Scheduled completion: 2083/06/25 B.S. Contract duration: 9 months.',
      'Portfolio snapshot: near completion — finishing works in progress.',
      'published'::public.content_status,
      now(),
      null::date,
      null::date,
      null::integer,
      false,
      '/images/portfolio/sher-khadka-proposed-design.jpg',
      4
    ),
    (
      'Hari Bahadur Pariyar — Structure Work',
      'hari-bahadur-pariyar-structure-work',
      'Residential / Structure work',
      'Jamani, Dang',
      'Hari Bahadur Pariyar',
      null::text,
      null::text,
      'Structure work completed under a labour contract.',
      'Labour contract — structure work.',
      'Contract value: NPR 20,00,000 (Rs. 20 Lakh). Contract duration: 5 months.',
      'Portfolio status: completed on schedule.',
      'published'::public.content_status,
      now(),
      null::date,
      null::date,
      null::integer,
      false,
      '/images/portfolio/hari-pariyar-complete.jpg',
      5
    )
)
insert into public.projects (
  title,
  slug,
  category,
  location,
  client,
  main_contractor,
  financing,
  description,
  scope_of_work,
  execution_details,
  project_status,
  status,
  published_at,
  start_date,
  completion_date,
  manpower,
  featured,
  cover_image_path,
  sort_order
)
select
  title,
  slug,
  category,
  location,
  client,
  main_contractor,
  financing,
  description,
  scope_of_work,
  execution_details,
  project_status,
  status,
  published_at,
  start_date,
  completion_date,
  manpower,
  featured,
  cover_image_path,
  sort_order
from seed_projects
on conflict (lower(slug)) do update
set
  title = excluded.title,
  category = excluded.category,
  location = excluded.location,
  client = excluded.client,
  main_contractor = excluded.main_contractor,
  financing = excluded.financing,
  description = excluded.description,
  scope_of_work = excluded.scope_of_work,
  execution_details = excluded.execution_details,
  project_status = excluded.project_status,
  status = excluded.status,
  published_at = coalesce(projects.published_at, excluded.published_at),
  start_date = excluded.start_date,
  completion_date = excluded.completion_date,
  manpower = excluded.manpower,
  featured = excluded.featured,
  cover_image_path = excluded.cover_image_path,
  sort_order = excluded.sort_order;

-- Project media. The update/insert pattern is idempotent because media tables
-- intentionally have no uniqueness constraint on a path.

with seed_project_images (
  project_slug,
  image_path,
  caption,
  alt_text,
  sort_order
) as (
  values
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-crb-shuttering-site.png', 'Shuttering works of the Control Room Building (CRB).', 'Control Room Building shuttering works at Murkuti Substation.', 1),
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-crb-shuttering.png', 'Control Room Building shuttering.', 'Control Room Building shuttering at Murkuti Substation.', 2),
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-crb-slab-casting-site.png', 'Control Room Building slab casting.', 'Control Room Building slab casting at Murkuti Substation.', 3),
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-crb-slab-casting.png', 'Control Room Building slab casting.', 'Control Room Building slab casting at Murkuti Substation.', 4),
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-crb-formwork-removed.png', 'Control Room Building after removal of formwork.', 'Control Room Building after formwork removal at Murkuti Substation.', 5),
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-staff-quarter-shuttering.png', 'Staff Quarter shuttering.', 'Staff Quarter shuttering at Murkuti Substation.', 6),
    ('murkuti-substation-control-room-and-staff-quarter', '/images/portfolio/murkuti-staff-quarter-slab-casting.png', 'Staff Quarter after slab casting.', 'Staff Quarter after slab casting at Murkuti Substation.', 7),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-proposed-design.jpg', 'Proposed building design.', 'Proposed 3D architectural visualization of the four-storey residential building.', 1),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-foundation-progress.jpg', 'Site progress photograph — foundation stage.', 'Foundation-stage site progress at the Gehendra Oli residential building.', 2),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-foundation-progress-2.jpg', 'RCC column and toe wall works in progress — foundation stage.', 'Foundation and RCC column works in progress at the Gehendra Oli residential building.', 3),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-toe-wall-reinforcement.jpg', 'Completed toe wall and column reinforcement layout.', 'Completed toe wall and column reinforcement layout.', 4),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-rcc-columns.jpg', 'RCC columns cast above plinth-level toe wall.', 'RCC columns cast above the plinth-level toe wall, ready for further construction.', 5),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-contract-signing.jpg', 'Contract signing.', 'Contract signing for the Gehendra Oli residential building.', 6),
    ('gehendra-oli-four-storey-residential-building', '/images/portfolio/gehendra-oli-contract-signing-2.jpg', 'Contract signing.', 'Contract signing for the Gehendra Oli residential building.', 7),
    ('krishna-oli-floor-addition', '/images/portfolio/krishna-oli-proposed-design.jpg', 'Proposed building design.', 'Proposed building design for the Krishna Oli 1.5-storey floor addition.', 1),
    ('krishna-oli-floor-addition', '/images/portfolio/krishna-oli-contract-signing.jpg', 'Contract signing.', 'Contract signing for the Krishna Oli floor addition.', 2),
    ('krishna-oli-floor-addition', '/images/portfolio/krishna-oli-roof-slab-shuttering.jpg', 'Superstructure works — roof slab shuttering in progress.', 'Superstructure works with roof slab shuttering in progress.', 3),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-proposed-design.jpg', 'Proposed building design.', 'Proposed building design for the Sher Bahadur Khadka residential building.', 1),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-contract-signing.jpg', 'Contract signing.', 'Contract signing for the Sher Bahadur Khadka residential building.', 2),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-foundation-footings.jpg', 'Foundation stage — isolated column footings cast.', 'Isolated column footings cast at foundation stage.', 3),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-foundation-toe-wall.jpg', 'Foundation toe wall and column base.', 'Foundation toe wall and column base under construction.', 4),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-toe-wall-reinforcement.jpg', 'Foundation toe wall completed with column reinforcement.', 'Foundation toe wall completed with column reinforcement.', 5),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-slab-reinforcement.jpg', 'Roof slab reinforcement work in progress.', 'Roof slab reinforcement work in progress.', 6),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-superstructure-shuttering.jpg', 'Superstructure rising — brickwork complete with roof shuttering at top floor.', 'Brickwork complete with roof shuttering at the top floor.', 7),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-brickwork.jpg', 'Brickwork complete to top floor, ready for plastering.', 'Brickwork complete to top floor, ready for plastering.', 8),
    ('sher-bahadur-khadka-residential-building', '/images/portfolio/sher-khadka-finishing.jpg', 'Plastering and finishing works in progress.', 'Plastering and finishing works in progress.', 9),
    ('hari-bahadur-pariyar-structure-work', '/images/portfolio/hari-pariyar-roof-shuttering.jpg', 'Roof slab shuttering with bamboo formwork at top floor prior to casting.', 'Roof slab shuttering with bamboo formwork at top floor before casting.', 1),
    ('hari-bahadur-pariyar-structure-work', '/images/portfolio/hari-pariyar-roof-complete.jpg', 'Structure work completed to roof level — brickwork and parapet complete.', 'Structure work completed to roof level, with brickwork and parapet complete.', 2),
    ('hari-bahadur-pariyar-structure-work', '/images/portfolio/hari-pariyar-brick-facade.jpg', 'Completed structure — brick facade prior to plaster.', 'Completed structure with brick facade before plastering.', 3),
    ('hari-bahadur-pariyar-structure-work', '/images/portfolio/hari-pariyar-plastering.jpg', 'Plastering works completed, with scaffolding still in place.', 'Plastering works completed with scaffolding still in place.', 4),
    ('hari-bahadur-pariyar-structure-work', '/images/portfolio/hari-pariyar-side-view.jpg', 'Completed building — side view with scaffolding partially removed.', 'Completed building side view with scaffolding partially removed.', 5),
    ('hari-bahadur-pariyar-structure-work', '/images/portfolio/hari-pariyar-complete.jpg', 'Final completed structure — plastering finished, water tank installed and scaffolding removed.', 'Final completed structure with plastering finished, water tank installed and scaffolding removed.', 6)
),
resolved as (
  select
    project.id as project_id,
    seed.image_path,
    seed.caption,
    seed.alt_text,
    seed.sort_order
  from seed_project_images seed
  join public.projects project on lower(project.slug) = lower(seed.project_slug)
),
updated_rows as (
  update public.project_images image
  set
    caption = source.caption,
    alt_text = source.alt_text,
    sort_order = source.sort_order
  from resolved source
  where image.project_id = source.project_id
    and image.image_path = source.image_path
  returning image.id
)
insert into public.project_images (
  project_id,
  image_path,
  caption,
  alt_text,
  sort_order
)
select
  source.project_id,
  source.image_path,
  source.caption,
  source.alt_text,
  source.sort_order
from resolved source
where not exists (
  select 1
  from public.project_images image
  where image.project_id = source.project_id
    and image.image_path = source.image_path
);

-- Gallery albums and the same documented portfolio photographs -------------

with seed_albums (
  title,
  slug,
  description,
  cover_image_path,
  category,
  featured,
  sort_order,
  status,
  published_at
) as (
  values
    (
      'Murkuti Substation — CRB & Staff Quarter',
      'murkuti-substation-crb-and-staff-quarter',
      'Portfolio documentation for the Control Room Building and Staff Quarter at Murkuti Substation.',
      '/images/portfolio/murkuti-crb-shuttering-site.png',
      'Substation civil works',
      true,
      1,
      'published'::public.content_status,
      now()
    ),
    (
      'Gehendra Oli — Residential Building',
      'gehendra-oli-residential-building',
      'Portfolio images for the Gehendra Oli four-storey residential building turnkey contract.',
      '/images/portfolio/gehendra-oli-proposed-design.jpg',
      'Residential',
      false,
      2,
      'published'::public.content_status,
      now()
    ),
    (
      'Krishna Oli — Floor Addition',
      'krishna-oli-floor-addition',
      'Portfolio images for the Krishna Oli 1.5-storey floor addition turnkey contract.',
      '/images/portfolio/krishna-oli-proposed-design.jpg',
      'Residential',
      false,
      3,
      'published'::public.content_status,
      now()
    ),
    (
      'Sher Bahadur Khadka — Residential Building',
      'sher-bahadur-khadka-residential-building',
      'Portfolio images for the Sher Bahadur Khadka residential building turnkey contract.',
      '/images/portfolio/sher-khadka-proposed-design.jpg',
      'Residential',
      false,
      4,
      'published'::public.content_status,
      now()
    ),
    (
      'Hari Bahadur Pariyar — Structure Work',
      'hari-bahadur-pariyar-structure-work',
      'Portfolio images for the completed Hari Bahadur Pariyar structure work labour contract.',
      '/images/portfolio/hari-pariyar-complete.jpg',
      'Residential',
      false,
      5,
      'published'::public.content_status,
      now()
    )
)
insert into public.gallery_albums (
  title,
  slug,
  description,
  cover_image_path,
  category,
  featured,
  sort_order,
  status,
  published_at
)
select
  title,
  slug,
  description,
  cover_image_path,
  category,
  featured,
  sort_order,
  status,
  published_at
from seed_albums
on conflict (lower(slug)) do update
set
  title = excluded.title,
  description = excluded.description,
  cover_image_path = excluded.cover_image_path,
  category = excluded.category,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = coalesce(gallery_albums.published_at, excluded.published_at);

-- Static portfolio paths distinguish these seed rows from later Storage
-- uploads. Linking them to their project media keeps captions/alt text in sync
-- while preserving any administrator-uploaded media outside this seed set.
with album_projects (album_slug, project_slug) as (
  values
    ('murkuti-substation-crb-and-staff-quarter', 'murkuti-substation-control-room-and-staff-quarter'),
    ('gehendra-oli-residential-building', 'gehendra-oli-four-storey-residential-building'),
    ('krishna-oli-floor-addition', 'krishna-oli-floor-addition'),
    ('sher-bahadur-khadka-residential-building', 'sher-bahadur-khadka-residential-building'),
    ('hari-bahadur-pariyar-structure-work', 'hari-bahadur-pariyar-structure-work')
),
resolved as (
  select
    album.id as album_id,
    image.image_path,
    image.caption,
    image.alt_text,
    image.sort_order
  from album_projects mapping
  join public.gallery_albums album on lower(album.slug) = lower(mapping.album_slug)
  join public.projects project on lower(project.slug) = lower(mapping.project_slug)
  join public.project_images image on image.project_id = project.id
  where image.image_path like '/images/portfolio/%'
),
updated_rows as (
  update public.gallery_images image
  set
    caption = source.caption,
    alt_text = source.alt_text,
    sort_order = source.sort_order
  from resolved source
  where image.album_id = source.album_id
    and image.image_path = source.image_path
  returning image.id
)
insert into public.gallery_images (
  album_id,
  image_path,
  caption,
  alt_text,
  sort_order
)
select
  source.album_id,
  source.image_path,
  source.caption,
  source.alt_text,
  source.sort_order
from resolved source
where not exists (
  select 1
  from public.gallery_images image
  where image.album_id = source.album_id
    and image.image_path = source.image_path
);

-- Create an admin after creating the account in Supabase Auth:
-- update public.profiles set is_admin = true where id = '<auth-user-uuid>';
