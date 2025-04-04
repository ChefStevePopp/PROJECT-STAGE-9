ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS station TEXT;

-- Check if the table is already in the realtime publication before adding it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'prep_list_template_tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;
  END IF;
END $$;