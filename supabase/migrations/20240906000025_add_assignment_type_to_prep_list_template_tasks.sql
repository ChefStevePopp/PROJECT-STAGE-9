-- Add assignment_type column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS assignment_type text;

-- Update existing records to have a default assignment_type based on their current state
UPDATE prep_list_template_tasks
SET assignment_type = 
  CASE 
    WHEN lottery = true THEN 'lottery'
    WHEN assignee_id IS NOT NULL THEN 'direct'
    WHEN kitchen_station IS NOT NULL OR station IS NOT NULL THEN 'station'
    ELSE NULL
  END;

-- Add the column to the realtime publication
ALTER publication supabase_realtime ADD TABLE prep_list_template_tasks;
