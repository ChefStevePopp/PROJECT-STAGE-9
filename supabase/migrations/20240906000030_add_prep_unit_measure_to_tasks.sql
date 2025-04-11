-- Add prep_unit_measure column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS prep_unit_measure TEXT;

-- Add the column to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;