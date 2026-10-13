-- Run after the application has deployed the required admin stage selector.
do $$
begin
  if exists (select 1 from public.projects where stage is null) then
    raise exception 'Assign a stage to every project before requiring the column';
  end if;
end
$$;

alter table public.projects alter column stage set not null;
