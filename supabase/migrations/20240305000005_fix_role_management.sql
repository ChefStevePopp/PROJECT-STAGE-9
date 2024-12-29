-- Consolidate role management
DO $$
BEGIN
  -- First, add system_role to profiles table
  ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS system_role text 
  CHECK (system_role IN ('dev', 'user'));

  -- Remove the generic role column from profiles as it's redundant
  -- Organization roles should be managed solely through organization_members
  ALTER TABLE profiles 
  DROP COLUMN IF EXISTS role;

  -- Update Steve's profile to have dev system_role
  UPDATE profiles 
  SET system_role = 'dev'
  WHERE id IN (
    SELECT id 
    FROM auth.users 
    WHERE email = 'office@memphisfirebbq.com'
  );

  -- Ensure organization_members roles are properly constrained
  ALTER TABLE organization_members 
  DROP CONSTRAINT IF EXISTS organization_members_role_check;

  ALTER TABLE organization_members 
  ADD CONSTRAINT organization_members_role_check 
  CHECK (role IN ('owner', 'admin', 'manager', 'staff'));

  -- Update auth.users metadata to match
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data,
    '{system_role}',
    '"dev"'::jsonb
  )
  WHERE email = 'office@memphisfirebbq.com';

END $$;