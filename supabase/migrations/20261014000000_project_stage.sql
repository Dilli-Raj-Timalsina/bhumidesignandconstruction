-- Project stage describes real-world progress. Publication remains in `status`;
-- the existing `project_status` text remains the portfolio progress note.
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'project_stage'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.project_stage as enum ('completed', 'ongoing', 'upcoming');
  end if;
end
$$;

alter table public.projects
  add column if not exists stage public.project_stage;

-- These are the five projects documented in the supplied portfolio. A
-- completed casting milestone does not make the entire project complete.
update public.projects
set stage = case
  when slug = 'hari-bahadur-pariyar-structure-work'
    then 'completed'::public.project_stage
  else 'ongoing'::public.project_stage
end
where stage is null
  and slug in (
    'murkuti-substation-control-room-and-staff-quarter',
    'gehendra-oli-four-storey-residential-building',
    'krishna-oli-floor-addition',
    'sher-bahadur-khadka-residential-building',
    'hari-bahadur-pariyar-structure-work'
  );

create index if not exists projects_public_stage_idx
  on public.projects (status, stage, sort_order);

grant usage on type public.project_stage to anon, authenticated;

comment on column public.projects.stage is
  'Completed, ongoing, or upcoming project filter; independent of draft/published visibility.';
