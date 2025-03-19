-- Add all potentially missing columns to the csv_mappings table
ALTER TABLE csv_mappings
ADD COLUMN IF NOT EXISTS employee_name_field TEXT,
ADD COLUMN IF NOT EXISTS role_field TEXT,
ADD COLUMN IF NOT EXISTS date_field TEXT,
ADD COLUMN IF NOT EXISTS start_time_field TEXT,
ADD COLUMN IF NOT EXISTS end_time_field TEXT,
ADD COLUMN IF NOT EXISTS break_duration_field TEXT,
ADD COLUMN IF NOT EXISTS notes_field TEXT,
ADD COLUMN IF NOT EXISTS monday_field TEXT,
ADD COLUMN IF NOT EXISTS tuesday_field TEXT,
ADD COLUMN IF NOT EXISTS wednesday_field TEXT,
ADD COLUMN IF NOT EXISTS thursday_field TEXT,
ADD COLUMN IF NOT EXISTS friday_field TEXT,
ADD COLUMN IF NOT EXISTS saturday_field TEXT,
ADD COLUMN IF NOT EXISTS sunday_field TEXT,
ADD COLUMN IF NOT EXISTS time_format TEXT,
ADD COLUMN IF NOT EXISTS role_pattern TEXT;

-- Refresh the schema cache for this table
COMMENT ON TABLE csv_mappings IS 'CSV mapping configurations for different formats';
