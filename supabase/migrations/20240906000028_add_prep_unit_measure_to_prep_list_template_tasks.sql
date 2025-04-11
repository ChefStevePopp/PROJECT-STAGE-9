-- Add prep_unit_measure column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS prep_unit_measure TEXT;

-- Note: cases and units columns already exist from previous migration