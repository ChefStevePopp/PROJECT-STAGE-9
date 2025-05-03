-- Rename station column to default_station in prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks
RENAME COLUMN station TO default_station;

-- Update realtime publication
alter publication supabase_realtime add table prep_list_template_tasks;
