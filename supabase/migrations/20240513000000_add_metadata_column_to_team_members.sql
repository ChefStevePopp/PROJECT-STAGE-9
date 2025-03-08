-- Add metadata column to organization_team_members table
ALTER TABLE public.organization_team_members
ADD COLUMN IF NOT EXISTS metadata jsonb NULL DEFAULT '{}'::jsonb;

-- Create index for faster queries on the metadata column
CREATE INDEX IF NOT EXISTS idx_org_team_members_metadata
ON public.organization_team_members USING GIN (metadata);
