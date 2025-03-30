-- Update RLS policies for prep_lists table to include office@memphisfirebbq.com and isDEV=true

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view their prep lists" ON prep_lists;
DROP POLICY IF EXISTS "Organization members can insert their prep lists" ON prep_lists;
DROP POLICY IF EXISTS "Organization members can update their prep lists" ON prep_lists;
DROP POLICY IF EXISTS "Organization members can delete their prep lists" ON prep_lists;

-- Enable RLS on the table
ALTER TABLE prep_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for organization members
CREATE POLICY "Organization members can view their prep lists"
  ON prep_lists
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = auth.email()
    ) OR 
    auth.email() = 'office@memphisfirebbq.com' OR
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND is_dev = true)
  );

CREATE POLICY "Organization members can insert their prep lists"
  ON prep_lists
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = auth.email()
    ) OR 
    auth.email() = 'office@memphisfirebbq.com' OR
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND is_dev = true)
  );

CREATE POLICY "Organization members can update their prep lists"
  ON prep_lists
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = auth.email()
    ) OR 
    auth.email() = 'office@memphisfirebbq.com' OR
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND is_dev = true)
  );

CREATE POLICY "Organization members can delete their prep lists"
  ON prep_lists
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = auth.email()
    ) OR 
    auth.email() = 'office@memphisfirebbq.com' OR
    EXISTS (SELECT 1 FROM users WHERE email = auth.email() AND is_dev = true)
  );
