-- Create activity_logs table
create table if not exists public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_type text not null,
  details jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb
);

-- Add RLS policies
alter table public.activity_logs enable row level security;

create policy "Users can view activity logs for their organization" on public.activity_logs
  for select using (
    auth.uid() in (
      select user_id 
      from organization_team_members 
      where organization_id = activity_logs.organization_id
    )
  );

create policy "Users can insert activity logs for their organization" on public.activity_logs
  for insert with check (
    auth.uid() in (
      select user_id 
      from organization_team_members 
      where organization_id = activity_logs.organization_id
    )
  );

-- Add indexes
create index activity_logs_organization_id_idx on public.activity_logs(organization_id);
create index activity_logs_user_id_idx on public.activity_logs(user_id);
create index activity_logs_created_at_idx on public.activity_logs(created_at desc);

-- Grant permissions
grant select, insert on public.activity_logs to authenticated;
