-- Add RLS policy for dev users to allow inserting into schedule_shifts
CREATE POLICY "Allow dev users to insert schedule_shifts" 
ON schedule_shifts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Add RLS policy for dev users to allow selecting from schedule_shifts
CREATE POLICY "Allow dev users to select schedule_shifts" 
ON schedule_shifts 
FOR SELECT 
TO authenticated
USING (true);

-- Add RLS policy for dev users to allow updating schedule_shifts
CREATE POLICY "Allow dev users to update schedule_shifts" 
ON schedule_shifts 
FOR UPDATE 
TO authenticated
USING (true);
