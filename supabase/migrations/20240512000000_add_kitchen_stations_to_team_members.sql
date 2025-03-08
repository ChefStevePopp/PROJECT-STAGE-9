-- Add kitchen_stations column to organization_team_members table
ALTER TABLE public.organization_team_members
ADD COLUMN IF NOT EXISTS kitchen_stations text[] NULL DEFAULT '{}'::text[];

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_org_team_members_kitchen_stations
ON public.organization_team_members USING GIN (kitchen_stations);

-- Update existing metadata to include kitchen_stations if needed
UPDATE public.organization_team_members
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{kitchen_stations}',
  '[]'::jsonb
)
WHERE metadata IS NULL OR NOT metadata ? 'kitchen_stations';
