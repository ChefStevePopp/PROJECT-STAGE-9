-- Drop existing policies
DROP POLICY IF EXISTS "Manage master ingredients" ON master_ingredients;

-- Create new policy
CREATE POLICY "Manage master ingredients" ON master_ingredients
USING (
  -- Dev users can do anything
  (auth.jwt() ->> 'raw_user_meta_data')::jsonb ->> 'role' = 'dev'
  OR
  -- Users can only access their organization's ingredients
  organization_id::text = ((auth.jwt() ->> 'raw_user_meta_data')::jsonb ->> 'organizationId')
)
WITH CHECK (
  -- Dev users can do anything
  (auth.jwt() ->> 'raw_user_meta_data')::jsonb ->> 'role' = 'dev'
  OR
  -- Users can only modify their organization's ingredients
  organization_id::text = ((auth.jwt() ->> 'raw_user_meta_data')::jsonb ->> 'organizationId')
);