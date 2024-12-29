-- Add kitchen_role column to organization_team_members
ALTER TABLE organization_team_members
ADD COLUMN IF NOT EXISTS kitchen_role TEXT CHECK (kitchen_role IN ('owner', 'chef', 'sous_chef', 'supervisor', 'team_member')) DEFAULT 'team_member';

-- Add index for kitchen_role
CREATE INDEX IF NOT EXISTS idx_org_team_members_kitchen_role 
ON organization_team_members(kitchen_role);

-- Add helpful comment
COMMENT ON COLUMN organization_team_members.kitchen_role IS 'Kitchen-specific role for operational permissions';

-- Update existing team members to have appropriate kitchen roles based on their current roles
UPDATE organization_team_members
SET kitchen_role = CASE
  WHEN 'owner' = ANY(roles) THEN 'owner'
  WHEN 'chef' = ANY(roles) THEN 'chef'
  WHEN 'sous_chef' = ANY(roles) THEN 'sous_chef'
  WHEN 'supervisor' = ANY(roles) THEN 'supervisor'
  ELSE 'team_member'
END
WHERE kitchen_role IS NULL;

-- Ensure Steve has the correct kitchen role
UPDATE organization_team_members
SET kitchen_role = 'owner'
WHERE email = 'office@memphisfirebbq.com';