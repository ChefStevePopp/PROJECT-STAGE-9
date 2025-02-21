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

-- Add trigger to set organization_id from JWT if not provided
CREATE OR REPLACE FUNCTION set_organization_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'raw_user_meta_data')::jsonb ->> 'organizationId';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_organization_id_trigger ON master_ingredients;

CREATE TRIGGER set_organization_id_trigger
  BEFORE INSERT ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id();