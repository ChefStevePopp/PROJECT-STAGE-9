-- Create activity_stream_diffs table to track changes in activity logs
create table if not exists public.activity_stream_diffs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  activity_log_id uuid references public.activity_logs(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  table_name text not null,
  record_id uuid not null,
  old_values jsonb default '{}'::jsonb,
  new_values jsonb default '{}'::jsonb,
  diff jsonb default '{}'::jsonb
);

-- Add RLS policies
alter table public.activity_stream_diffs enable row level security;

create policy "Users can view activity stream diffs for their organization" on public.activity_stream_diffs
  for select using (
    auth.uid() in (
      select user_id 
      from organization_team_members 
      where organization_id = activity_stream_diffs.organization_id
    )
  );

create policy "Users can insert activity stream diffs for their organization" on public.activity_stream_diffs
  for insert with check (
    auth.uid() in (
      select user_id 
      from organization_team_members 
      where organization_id = activity_stream_diffs.organization_id
    )
  );

-- Add indexes
create index activity_stream_diffs_activity_log_id_idx on public.activity_stream_diffs(activity_log_id);
create index activity_stream_diffs_organization_id_idx on public.activity_stream_diffs(organization_id);
create index activity_stream_diffs_table_name_idx on public.activity_stream_diffs(table_name);
create index activity_stream_diffs_record_id_idx on public.activity_stream_diffs(record_id);
create index activity_stream_diffs_created_at_idx on public.activity_stream_diffs(created_at desc);

-- Grant permissions
grant select, insert on public.activity_stream_diffs to authenticated;
