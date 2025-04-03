-- Add viewer_team_members column to prep_lists table
ALTER TABLE prep_lists ADD COLUMN IF NOT EXISTS viewer_team_members TEXT[] DEFAULT '{}'::TEXT[];

-- Add this table to the realtime publication if it's not already there
ALTER PUBLICATION supabase_realtime ADD TABLE prep_lists;
