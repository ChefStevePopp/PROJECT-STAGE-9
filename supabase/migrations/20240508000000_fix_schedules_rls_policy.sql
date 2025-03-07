-- Fix RLS policies for schedules tables to allow organization members access

-- Drop existing policies
DROP POLICY IF EXISTS "Allow DEV users to access schedules" ON schedules;
DROP POLICY IF EXISTS "Allow DEV users to access schedule_shifts" ON schedule_shifts;
DROP POLICY IF EXISTS "Allow organization members to access schedules" ON schedules;
DROP POLICY IF EXISTS "Allow organization members to access schedule_shifts" ON schedule_shifts;

-- Enable RLS on tables
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for organization members to access schedules
CREATE POLICY "Allow organization members to access schedules"
  ON schedules
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members 
      WHERE id = auth.uid()
    )
  );

-- Create policies for organization members to access schedule_shifts
CREATE POLICY "Allow organization members to access schedule_shifts"
  ON schedule_shifts
  FOR ALL
  USING (
    schedule_id IN (
      SELECT id FROM schedules
      WHERE organization_id IN (
        SELECT organization_id FROM organization_team_members 
        WHERE id = auth.uid()
      )
    )
  );

-- Create policies for DEV users to access schedules
CREATE POLICY "Allow DEV users to access schedules"
  ON schedules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles 
      WHERE user_id = auth.uid() AND role = 'DEV'
    )
  );

-- Create policies for DEV users to access schedule_shifts
CREATE POLICY "Allow DEV users to access schedule_shifts"
  ON schedule_shifts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles 
      WHERE user_id = auth.uid() AND role = 'DEV'
    )
  );
