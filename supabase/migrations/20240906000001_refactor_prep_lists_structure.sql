-- First, check if saved_prep_lists table exists and drop it if it does
DROP TABLE IF EXISTS saved_prep_lists;

-- Check if template_id column exists in prep_lists, add it if it doesn't
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_lists' AND column_name = 'template_id') THEN
    ALTER TABLE prep_lists ADD COLUMN template_id UUID REFERENCES prep_list_templates(id);
  END IF;
END $$;

-- Add foreign key constraint between tasks and prep_lists if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tasks_prep_list_id_fkey' 
    AND table_name = 'tasks'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'prep_list_id'
  ) THEN
    ALTER TABLE tasks
    ADD CONSTRAINT tasks_prep_list_id_fkey
    FOREIGN KEY (prep_list_id) REFERENCES prep_lists(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies for prep_lists
DROP POLICY IF EXISTS "Users can view their organization's prep lists" ON prep_lists;
CREATE POLICY "Users can view their organization's prep lists"
ON prep_lists
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their organization's prep lists" ON prep_lists;
CREATE POLICY "Users can insert their organization's prep lists"
ON prep_lists
FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can update their organization's prep lists" ON prep_lists;
CREATE POLICY "Users can update their organization's prep lists"
ON prep_lists
FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their organization's prep lists" ON prep_lists;
CREATE POLICY "Users can delete their organization's prep lists"
ON prep_lists
FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
  )
);

-- Enable realtime for prep_lists
alter publication supabase_realtime add table prep_lists;
