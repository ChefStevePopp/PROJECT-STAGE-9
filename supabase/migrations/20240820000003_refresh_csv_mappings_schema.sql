-- Refresh the schema cache for csv_mappings table
NOTIFY pgrst, 'reload schema';

-- Ensure column_mapping JSON column exists (for storing the full mapping configuration)
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS column_mapping JSONB;

-- Make sure all fields exist
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS employee_name_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS role_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS date_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS start_time_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS end_time_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS break_duration_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS notes_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS monday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS tuesday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS wednesday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS thursday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS friday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS saturday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS sunday_field TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS time_format TEXT;
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS role_pattern TEXT;

-- Enable realtime again to ensure it's properly set up
ALTER PUBLICATION supabase_realtime ADD TABLE csv_mappings;
