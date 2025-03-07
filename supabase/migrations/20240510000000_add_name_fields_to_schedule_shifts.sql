-- Add first_name and last_name columns to schedule_shifts
ALTER TABLE schedule_shifts 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update existing records to split employee_name into first_name and last_name
-- This handles multiple first names by treating the last word as the last name
UPDATE schedule_shifts
SET 
  first_name = CASE 
    WHEN POSITION(' ' IN employee_name) = 0 THEN employee_name -- Only one name
    ELSE SUBSTRING(employee_name FROM 1 FOR POSITION(' ' IN REVERSE(employee_name)) - 1) -- Everything except last word
  END,
  last_name = CASE
    WHEN POSITION(' ' IN employee_name) = 0 THEN '' -- Only one name
    ELSE SUBSTRING(employee_name FROM LENGTH(employee_name) - POSITION(' ' IN REVERSE(employee_name)) + 2) -- Just the last word
  END;

-- Add RLS policy for dev users
CREATE POLICY "Allow dev users to insert schedule_shifts" 
ON schedule_shifts 
FOR INSERT 
TO authenticated
WITH CHECK (true);