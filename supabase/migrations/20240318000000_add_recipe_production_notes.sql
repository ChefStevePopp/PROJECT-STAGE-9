-- Add production notes columns to recipes table
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS working_temperature_notes text,
  ADD COLUMN IF NOT EXISTS time_management_notes text,
  ADD COLUMN IF NOT EXISTS yield_amount text;

-- Update RLS policies to include new columns
CREATE POLICY "Users can update their organization's recipe production notes"
  ON recipes
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE auth.uid() = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE auth.uid() = auth.uid()
  ));
