-- Add first_name and last_name columns to schedule_shifts
ALTER TABLE schedule_shifts 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Update existing records to split employee_name into first_name and last_name
UPDATE schedule_shifts
SET 
  first_name = SPLIT_PART(employee_name, ' ', 1),
  last_name = SUBSTRING(employee_name FROM POSITION(' ' IN employee_name) + 1);
