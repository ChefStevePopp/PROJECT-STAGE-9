-- Add kitchen_stations column to prep_lists table
ALTER TABLE prep_lists ADD COLUMN IF NOT EXISTS kitchen_stations TEXT[] DEFAULT '{}'::TEXT[];

-- Enable realtime for the table
alter publication supabase_realtime add table prep_lists;
