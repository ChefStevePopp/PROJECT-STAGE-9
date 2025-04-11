-- Fix cases column in prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS cases INTEGER DEFAULT 0;
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS units INTEGER DEFAULT 0;
