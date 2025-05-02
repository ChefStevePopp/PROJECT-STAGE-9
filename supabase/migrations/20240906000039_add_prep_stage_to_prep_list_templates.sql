-- Add prep_stage column to prep_list_templates table
ALTER TABLE prep_list_templates ADD COLUMN IF NOT EXISTS prep_stage TEXT;

-- No need to update realtime publication as the table is already added