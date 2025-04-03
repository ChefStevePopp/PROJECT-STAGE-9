-- Fix the relationship between prep_lists and prep_list_templates tables

-- First, ensure prep_list_template_tasks has proper foreign key constraints
ALTER TABLE IF EXISTS prep_list_template_tasks
DROP CONSTRAINT IF EXISTS prep_list_template_tasks_template_id_fkey,
ADD CONSTRAINT prep_list_template_tasks_template_id_fkey
FOREIGN KEY (template_id) REFERENCES prep_list_templates(id) ON DELETE CASCADE;

-- Ensure prep_lists has proper foreign key to templates
ALTER TABLE IF EXISTS prep_lists
DROP CONSTRAINT IF EXISTS prep_lists_template_id_fkey,
ADD CONSTRAINT prep_lists_template_id_fkey
FOREIGN KEY (template_id) REFERENCES prep_list_templates(id) ON DELETE SET NULL;

-- First check if prep_list_id column exists in tasks table
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'prep_list_id'
  ) THEN
    -- Ensure tasks table has proper foreign keys to prep_lists
    ALTER TABLE IF EXISTS tasks
    DROP CONSTRAINT IF EXISTS tasks_prep_list_id_fkey,
    ADD CONSTRAINT tasks_prep_list_id_fkey
    FOREIGN KEY (prep_list_id) REFERENCES prep_lists(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Check if prep_list_template_id column exists in tasks table
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'prep_list_template_id'
  ) THEN
    -- Ensure tasks table has proper foreign keys to prep_list_templates
    ALTER TABLE IF EXISTS tasks
    DROP CONSTRAINT IF EXISTS tasks_prep_list_template_id_fkey,
    ADD CONSTRAINT tasks_prep_list_template_id_fkey
    FOREIGN KEY (prep_list_template_id) REFERENCES prep_list_templates(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Fix the organization lookup in prep_list_templates store
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  -- First try to get from organization_team_members using user_id
  SELECT organization_id INTO org_id
  FROM organization_team_members
  WHERE user_id = get_user_organization_id.user_id
  LIMIT 1;
  
  -- If not found, try organization_roles
  IF org_id IS NULL THEN
    SELECT organization_id INTO org_id
    FROM organization_roles
    WHERE user_id = get_user_organization_id.user_id
    LIMIT 1;
  END IF;
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- Add index to improve lookup performance
CREATE INDEX IF NOT EXISTS idx_organization_team_members_user_id ON organization_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_roles_user_id ON organization_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_prep_lists_template_id ON prep_lists(template_id);

-- Create indexes only if columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'prep_list_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_prep_list_id ON tasks(prep_list_id);
  END IF;
  
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'prep_list_template_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_prep_list_template_id ON tasks(prep_list_template_id);
  END IF;
END
$$;

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE prep_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
