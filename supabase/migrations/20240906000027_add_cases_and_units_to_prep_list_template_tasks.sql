-- Add cases and units columns to prep_list_template_tasks table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'cases') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN cases INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'units') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN units INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;
