-- Fix the prep_lists table structure by removing the invalid user_id reference

-- Drop the existing foreign key constraint if it exists
ALTER TABLE IF EXISTS public.prep_lists
DROP CONSTRAINT IF EXISTS prep_lists_user_id_fkey;

-- Make sure all the foreign key constraints are properly set
ALTER TABLE IF EXISTS public.prep_lists
DROP CONSTRAINT IF EXISTS prep_lists_assigned_to_fkey,
DROP CONSTRAINT IF EXISTS prep_lists_completed_by_fkey,
DROP CONSTRAINT IF EXISTS prep_lists_created_by_fkey,
DROP CONSTRAINT IF EXISTS prep_lists_organization_id_fkey,
DROP CONSTRAINT IF EXISTS prep_lists_template_id_fkey;

-- Re-add the correct foreign key constraints
ALTER TABLE IF EXISTS public.prep_lists
ADD CONSTRAINT prep_lists_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id),
ADD CONSTRAINT prep_lists_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES auth.users(id),
ADD CONSTRAINT prep_lists_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
ADD CONSTRAINT prep_lists_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
ADD CONSTRAINT prep_lists_template_id_fkey FOREIGN KEY (template_id) REFERENCES prep_list_templates(id) ON DELETE SET NULL;

-- Enable realtime for the prep_lists table
ALTER PUBLICATION supabase_realtime ADD TABLE prep_lists;
