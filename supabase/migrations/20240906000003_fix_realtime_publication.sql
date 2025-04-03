-- Fix the realtime publication error by checking if the table is already a member

-- Check if prep_lists is already in the publication before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'prep_lists'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE prep_lists;
  END IF;
END
$$;
