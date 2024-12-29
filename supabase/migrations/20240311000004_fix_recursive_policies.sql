-- Fix recursive policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "View organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "Manage organization roles" ON organization_roles;
  DROP POLICY IF EXISTS "View profiles" ON profiles;
  DROP POLICY IF EXISTS "Manage profiles" ON profiles;

  -- Create new non-recursive policies
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
      OR auth.uid() IN (
        SELECT id FROM auth.users
        WHERE raw_user_meta_data->>'system_role' = 'dev'
      )
    );
END $$;