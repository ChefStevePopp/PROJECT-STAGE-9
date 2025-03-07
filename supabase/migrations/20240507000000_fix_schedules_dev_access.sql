-- Fix RLS policies for schedules tables to allow DEV users access

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow DEV users to access schedules" ON schedules;
DROP POLICY IF EXISTS "Allow DEV users to access schedule_shifts" ON schedule_shifts;

-- Create policies for DEV users to access schedules
CREATE POLICY "Allow DEV users to access schedules"
  ON schedules
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.uid() IN (SELECT user_id FROM organization_roles WHERE role = 'DEV')
    )
  );

-- Create policies for DEV users to access schedule_shifts
CREATE POLICY "Allow DEV users to access schedule_shifts"
  ON schedule_shifts
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users 
      WHERE auth.uid() IN (SELECT user_id FROM organization_roles WHERE role = 'DEV')
    )
  );
