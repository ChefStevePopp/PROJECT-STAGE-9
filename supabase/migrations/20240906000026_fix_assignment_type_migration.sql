-- This migration fixes the previous migration by removing the attempt to add the table to the realtime publication
-- since the publication is already set to FOR ALL TABLES

-- Add assignment_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'assignment_type') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN assignment_type text;
  END IF;
END $$;

-- Update existing records based on their current assignment status
UPDATE prep_list_template_tasks
SET assignment_type = 
  CASE 
    WHEN lottery = true THEN 'lottery'
    WHEN assignee_id IS NOT NULL THEN 'direct'
    WHEN kitchen_station IS NOT NULL THEN 'station'
    ELSE NULL
  END
WHERE assignment_type IS NULL;
