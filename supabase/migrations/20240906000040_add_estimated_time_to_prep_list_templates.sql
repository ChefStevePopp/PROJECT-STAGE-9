-- Add estimated_time column to prep_list_templates table
ALTER TABLE prep_list_templates ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 0;
