-- Remove redundant template_id column from prep_lists table
ALTER TABLE prep_lists DROP COLUMN IF EXISTS template_id;

-- Update realtime publication
alter publication supabase_realtime add table prep_lists;