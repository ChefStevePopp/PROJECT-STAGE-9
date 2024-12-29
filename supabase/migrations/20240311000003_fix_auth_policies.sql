-- Drop and recreate auth policies to ensure proper access
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "View profiles" ON profiles;
  DROP POLICY IF EXISTS "Manage profiles" ON profiles;

  -- Create new simplified policies
  CREATE POLICY "View organization roles"
    ON organization_roles FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Manage organization roles"
    ON organization_roles FOR ALL
    TO authenticated
    USING (
      auth.uid() = '859585ee-05a4-4660-806b-174d6f1cbe45'
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'system_role' = 'dev'
      )
      OR EXISTS (
        SELECT 1 FROM organizations
        WHERE id = organization_roles.organization_id
        AND owner_id = auth.uid()
      )
    );

  -- Profile policies
  CREATE POLICY "View profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Manage profiles"
    ON profiles FOR ALL
    TO authenticated
    USING (
      id = auth.uid()
      OR auth.uid() = '859585ee-05a4-4660-806b-174d6f1cbe45'
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid()
        AND raw_user_meta_data->>'system_role' = 'dev'
      )
    );
END $$;