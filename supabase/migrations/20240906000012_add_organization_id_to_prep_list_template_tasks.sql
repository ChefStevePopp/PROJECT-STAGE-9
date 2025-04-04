ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Check if the table is already in the publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'prep_list_template_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;
  END IF;
END
$$;