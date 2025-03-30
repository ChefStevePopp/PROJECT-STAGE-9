create table public.organization_team_members (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  organization_id uuid not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text null,
  punch_id text null,
  avatar_url text null,
  roles text[] null default '{}'::text[],
  departments text[] null default '{}'::text[],
  locations text[] null default '{}'::text[],
  notification_preferences jsonb null default '{"email": true, "mobile": true, "prep_tasks": true, "team_messages": true, "schedule_updates": true}'::jsonb,
  emergency_contact jsonb null default '{"name": null, "phone": null}'::jsonb,
  kitchen_role text null default 'team_member'::text,
  display_name text null,
  kitchen_stations text[] null default '{}'::text[],
  metadata jsonb null default '{}'::jsonb,
  constraint team_members_pkey primary key (id),
  constraint team_members_organization_id_email_key unique (organization_id, email),
  constraint team_members_organization_id_punch_id_key unique (organization_id, punch_id),
  constraint organization_team_members_kitchen_role_check check (
    (
      kitchen_role = any (
        array[
          'owner'::text,
          'chef'::text,
          'sous_chef'::text,
          'supervisor'::text,
          'team_member'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_org_team_members_kitchen_role on public.organization_team_members using btree (kitchen_role) TABLESPACE pg_default;

create index IF not exists idx_org_team_members_kitchen_stations on public.organization_team_members using gin (kitchen_stations) TABLESPACE pg_default;

create index IF not exists idx_org_team_members_metadata on public.organization_team_members using gin (metadata) TABLESPACE pg_default;

create trigger team_members_updated_at BEFORE
update on organization_team_members for EACH row
execute FUNCTION handle_team_member_updated ();

alter publication supabase_realtime add table organization_team_members;