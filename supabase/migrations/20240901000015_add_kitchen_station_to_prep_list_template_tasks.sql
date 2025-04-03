-- Add kitchen_station column to prep_list_template_tasks if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' 
                AND column_name = 'kitchen_station') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN kitchen_station text;
  END IF;
END $$;

-- Enable realtime for this table
alter publication supabase_realtime add table prep_list_template_tasks;
