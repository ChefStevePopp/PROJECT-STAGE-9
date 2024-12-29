-- Remove profiles table and consolidate auth
DO $$
BEGIN
  -- First migrate any important data to auth.users metadata
  UPDATE auth.users u
  SET raw_user_meta_data = jsonb_build_object(
    'firstName', COALESCE(p.first_name, u.raw_user_meta_data->>'firstName'),
    'lastName', COALESCE(p.last_name, u.raw_user_meta_data->>'lastName'),
    'system_role', COALESCE(p.system_role, u.raw_user_meta_data->>'system_role', 'user'),
    'organizationId', COALESCE(p.organization_id::text, u.raw_user_meta_data->>'organizationId')
  )
  FROM profiles p
  WHERE u.id = p.id;

  -- Drop profiles table and related objects
  DROP TABLE IF EXISTS profiles CASCADE;

  -- Update policies to use auth.users metadata directly
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;

  CREATE POLICY "View organization roles"
    ON organization_roles FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Manage organization roles"
    ON organization_roles FOR ALL
    TO authenticated
    USING (
      auth.uid() = '859585ee-05a4-4660-806b-174d6f1cbe45'
      OR auth.uid() IN (
        SELECT id FROM auth.users
        WHERE raw_user_meta_data->>'system_role' = 'dev'
      )
      OR auth.uid() IN (
        SELECT owner_id FROM organizations 
        WHERE id = organization_roles.organization_id
      )
    );

  -- Ensure Steve's data is correct
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'firstName', 'Steve',
    'lastName', 'Dev Popp',
    'system_role', 'dev',
    'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
  )
  WHERE id = '859585ee-05a4-4660-806b-174d6f1cbe45';
END $$;