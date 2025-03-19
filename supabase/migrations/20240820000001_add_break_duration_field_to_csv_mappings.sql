-- Add break_duration_field column to csv_mappings table
ALTER TABLE csv_mappings ADD COLUMN IF NOT EXISTS break_duration_field TEXT;
