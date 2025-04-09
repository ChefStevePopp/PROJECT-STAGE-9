-- Add auto_advance column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS auto_advance BOOLEAN DEFAULT FALSE;
