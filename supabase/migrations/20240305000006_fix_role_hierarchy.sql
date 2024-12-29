-- Fix role hierarchy and relationships
DO $$
BEGIN
  -- 1. System Level: Ensure system_role in profiles
  ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS system_role text 
  CHECK (system_role IN ('dev', 'user'));

  -- Set default system_role to 'user'
  UPDATE profiles 
  SET system_role = 'user' 
  WHERE system_role IS NULL;

  ALTER TABLE profiles 
  ALTER COLUMN system_role SET DEFAULT 'user';

  -- 2. Organization Level: Fix organization_members roles
  ALTER TABLE organization_members 
  DROP CONSTRAINT IF EXISTS organization_members_role_check;

  ALTER TABLE organization_members 
  ADD CONSTRAINT organization_members_role_check 
  CHECK (role IN ('owner', 'admin', 'manager', 'staff'));

  -- 3. Team Level: Enhance team_members table
  ALTER TABLE team_members 
  ADD COLUMN IF NOT EXISTS status text 
  CHECK (status IN ('active', 'inactive', 'on_leave'))
  DEFAULT 'active';

  ALTER TABLE team_members 
  ADD COLUMN IF NOT EXISTS employment_type text 
  CHECK (employment_type IN ('full_time', 'part_time', 'seasonal', 'temporary'))
  DEFAULT 'full_time';

  -- 4. Fix Steve's roles as both dev and organization owner
  WITH steve_user AS (
    SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'
  )
  UPDATE profiles 
  SET 
    system_role = 'dev',
    updated_at = CURRENT_TIMESTAMP
  FROM steve_user
  WHERE profiles.id = steve_user.id;

  -- Ensure Steve is organization owner
  WITH steve_user AS (
    SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'
  )
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role
  )
  SELECT 
    'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
    steve_user.id,
    'owner'
  FROM steve_user
  ON CONFLICT (organization_id, user_id) 
  DO UPDATE SET 
    role = 'owner',
    updated_at = CURRENT_TIMESTAMP;

  -- 5. Update auth.users metadata to match
  UPDATE auth.users 
  SET raw_user_meta_data = jsonb_build_object(
    'firstName', 'Steve',
    'lastName', 'Popp',
    'system_role', 'dev',
    'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
  )
  WHERE email = 'office@memphisfirebbq.com';

END $$;