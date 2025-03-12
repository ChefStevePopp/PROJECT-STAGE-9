-- Add additional fields to csv_mappings table
ALTER TABLE csv_mappings
ADD COLUMN IF NOT EXISTS format text,
ADD COLUMN IF NOT EXISTS employee_name_field text,
ADD COLUMN IF NOT EXISTS role_field text,
ADD COLUMN IF NOT EXISTS date_field text,
ADD COLUMN IF NOT EXISTS start_time_field text,
ADD COLUMN IF NOT EXISTS end_time_field text,
ADD COLUMN IF NOT EXISTS break_duration_field text,
ADD COLUMN IF NOT EXISTS notes_field text,
ADD COLUMN IF NOT EXISTS monday_field text,
ADD COLUMN IF NOT EXISTS tuesday_field text,
ADD COLUMN IF NOT EXISTS wednesday_field text,
ADD COLUMN IF NOT EXISTS thursday_field text,
ADD COLUMN IF NOT EXISTS friday_field text,
ADD COLUMN IF NOT EXISTS saturday_field text,
ADD COLUMN IF NOT EXISTS sunday_field text,
ADD COLUMN IF NOT EXISTS time_format text,
ADD COLUMN IF NOT EXISTS role_pattern text;

-- Add RLS policies
ALTER TABLE csv_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's CSV mappings"
  ON csv_mappings FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their organization's CSV mappings"
  ON csv_mappings FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's CSV mappings"
  ON csv_mappings FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their organization's CSV mappings"
  ON csv_mappings FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  ));