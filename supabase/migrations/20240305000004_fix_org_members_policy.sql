-- Drop ALL existing policies for organization_members
DO $$
DECLARE
  pol record;
BEGIN
  -- Drop all policies for the table
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'organization_members'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON organization_members', pol.policyname);
  END LOOP;
END $$;

-- Create new non-recursive policies
CREATE POLICY "Anyone can view organization members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners and admins can manage organization members"
  ON organization_members FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM organization_members 
      WHERE organization_id = organization_members.organization_id 
      AND role IN ('owner', 'admin')
    )
    OR
    auth.uid() IN (
      SELECT owner_id 
      FROM organizations 
      WHERE id = organization_members.organization_id
    )
  );

-- Update Steve's user metadata and ensure owner membership
DO $$
DECLARE
  steve_id uuid;
BEGIN
  -- Get Steve's user ID
  SELECT id INTO steve_id
  FROM auth.users
  WHERE email = 'office@memphisfirebbq.com';

  IF steve_id IS NOT NULL THEN
    -- Update user metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'firstName', 'Steve',
      'lastName', 'Popp',
      'role', 'owner',
      'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
    )
    WHERE id = steve_id;

    -- Ensure owner membership exists
    INSERT INTO organization_members (
      organization_id,
      user_id,
      role
    )
    VALUES (
      'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
      steve_id,
      'owner'
    )
    ON CONFLICT (organization_id, user_id) 
    DO UPDATE SET 
      role = 'owner',
      updated_at = CURRENT_TIMESTAMP;
  END IF;
END $$;