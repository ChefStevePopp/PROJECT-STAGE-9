-- Add departments column to operations_settings table
ALTER TABLE operations_settings ADD COLUMN IF NOT EXISTS departments TEXT[] DEFAULT '{}'::TEXT[];

-- Enable realtime for the table
alter publication supabase_realtime add table operations_settings;
