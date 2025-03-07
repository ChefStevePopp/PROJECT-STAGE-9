-- Add DEV user access to schedules table
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's schedules" ON schedules;
DROP POLICY IF EXISTS "Users can insert their organization's schedules" ON schedules;
DROP POLICY IF EXISTS "Users can update their organization's schedules" ON schedules;
DROP POLICY IF EXISTS "Users can delete their organization's schedules" ON schedules;
DROP POLICY IF EXISTS "DEV can access all schedules" ON schedules;

-- Create policies for regular users
CREATE POLICY "Users can view their organization's schedules"
ON schedules FOR SELECT
USING (organization_id = auth.jwt() ->> 'organizationId');

CREATE POLICY "Users can insert their organization's schedules"
ON schedules FOR INSERT
WITH CHECK (organization_id = auth.jwt() ->> 'organizationId');

CREATE POLICY "Users can update their organization's schedules"
ON schedules FOR UPDATE
USING (organization_id = auth.jwt() ->> 'organizationId');

CREATE POLICY "Users can delete their organization's schedules"
ON schedules FOR DELETE
USING (organization_id = auth.jwt() ->> 'organizationId');

-- Create policy for DEV user
CREATE POLICY "DEV can access all schedules"
ON schedules
USING (auth.uid() = '00000000-0000-0000-0000-000000000000' OR auth.jwt() ->> 'app_role' = 'DEV');

-- Also fix schedule_shifts table
ALTER TABLE schedule_shifts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's schedule shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Users can insert their organization's schedule shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Users can update their organization's schedule shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Users can delete their organization's schedule shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "DEV can access all schedule shifts" ON schedule_shifts;

-- Create policies for regular users (via join to schedules table)
CREATE POLICY "Users can view their organization's schedule shifts"
ON schedule_shifts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = schedule_shifts.schedule_id
    AND schedules.organization_id = auth.jwt() ->> 'organizationId'
  )
);

CREATE POLICY "Users can insert their organization's schedule shifts"
ON schedule_shifts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = schedule_shifts.schedule_id
    AND schedules.organization_id = auth.jwt() ->> 'organizationId'
  )
);

CREATE POLICY "Users can update their organization's schedule shifts"
ON schedule_shifts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = schedule_shifts.schedule_id
    AND schedules.organization_id = auth.jwt() ->> 'organizationId'
  )
);

CREATE POLICY "Users can delete their organization's schedule shifts"
ON schedule_shifts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM schedules
    WHERE schedules.id = schedule_shifts.schedule_id
    AND schedules.organization_id = auth.jwt() ->> 'organizationId'
  )
);

-- Create policy for DEV user
CREATE POLICY "DEV can access all schedule shifts"
ON schedule_shifts
USING (auth.uid() = '00000000-0000-0000-0000-000000000000' OR auth.jwt() ->> 'app_role' = 'DEV');
