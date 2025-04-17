-- Add kitchen_role column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS kitchen_role text;

-- Update realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;