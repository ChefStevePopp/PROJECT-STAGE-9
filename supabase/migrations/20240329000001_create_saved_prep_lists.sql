-- Create saved_prep_lists table to store prep list configurations
CREATE TABLE IF NOT EXISTS saved_prep_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  templates JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE saved_prep_lists ENABLE ROW LEVEL SECURITY;

-- Allow users to select their organization's saved prep lists
CREATE POLICY "Users can view their organization's saved prep lists"
ON saved_prep_lists FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_team_members
  WHERE user_id = auth.uid()
));

-- Allow users to insert saved prep lists for their organization
CREATE POLICY "Users can insert saved prep lists for their organization"
ON saved_prep_lists FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_team_members
  WHERE user_id = auth.uid()
));

-- Allow users to update their organization's saved prep lists
CREATE POLICY "Users can update their organization's saved prep lists"
ON saved_prep_lists FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM organization_team_members
  WHERE user_id = auth.uid()
));

-- Allow users to delete their organization's saved prep lists
CREATE POLICY "Users can delete their organization's saved prep lists"
ON saved_prep_lists FOR DELETE
USING (organization_id IN (
  SELECT organization_id FROM organization_team_members
  WHERE user_id = auth.uid()
));

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE saved_prep_lists;