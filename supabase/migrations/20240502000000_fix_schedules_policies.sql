-- Fix the policies that reference user_id which doesn't exist
-- The correct column is likely id in organization_team_members

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their organization's schedules" ON schedules;
DROP POLICY IF EXISTS "Users can view their organization's shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Users can view their organization's 7shifts integration" ON seven_shifts_integrations;

-- Recreate policies with correct column references
CREATE POLICY "Users can view their organization's schedules"
  ON schedules
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  ));

CREATE POLICY "Users can view their organization's shifts"
  ON schedule_shifts
  FOR SELECT
  USING (schedule_id IN (
    SELECT id FROM schedules WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can view their organization's 7shifts integration"
  ON seven_shifts_integrations
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  ));

-- Also fix the admin policies
DROP POLICY IF EXISTS "Admins can insert schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON schedules;
DROP POLICY IF EXISTS "Admins can insert shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Admins can update shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Admins can insert 7shifts integration" ON seven_shifts_integrations;
DROP POLICY IF EXISTS "Admins can update 7shifts integration" ON seven_shifts_integrations;

-- Recreate admin policies with correct column references
CREATE POLICY "Admins can insert schedules"
  ON schedules
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Admins can update schedules"
  ON schedules
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Admins can insert shifts"
  ON schedule_shifts
  FOR INSERT
  WITH CHECK (schedule_id IN (
    SELECT id FROM schedules WHERE organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  ));

CREATE POLICY "Admins can update shifts"
  ON schedule_shifts
  FOR UPDATE
  USING (schedule_id IN (
    SELECT id FROM schedules WHERE organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  ));

CREATE POLICY "Admins can insert 7shifts integration"
  ON seven_shifts_integrations
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Admins can update 7shifts integration"
  ON seven_shifts_integrations
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE id = auth.uid() AND role IN ('owner', 'admin')
  ));
