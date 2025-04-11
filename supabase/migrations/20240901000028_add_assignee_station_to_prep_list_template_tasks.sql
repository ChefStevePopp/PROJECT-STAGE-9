-- Add assignee_station column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS assignee_station text;
