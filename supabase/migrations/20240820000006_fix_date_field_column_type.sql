-- Fix the date_field column to accept NULL values and be of type TEXT instead of DATE
ALTER TABLE csv_mappings ALTER COLUMN date_field TYPE TEXT;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
