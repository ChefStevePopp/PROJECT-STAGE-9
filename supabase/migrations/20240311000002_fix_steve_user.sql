-- Fix Steve's user account and permissions
DO $$
DECLARE
  steve_id uuid := '859585ee-05a4-4660-806b-174d6f1cbe45';
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  -- Update Steve's auth user metadata only
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_build_object(
      'firstName', 'Steve',
      'lastName', 'Dev Popp',
      'system_role', 'dev',
      'organizationId', org_id
    ),
    email = 'office@memphisfirebbq.com',
    email_confirmed_at = now(),
    is_sso_user = false
  WHERE id = steve_id;

  -- Update profile
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    system_role,
    organization_id
  ) VALUES (
    steve_id,
    'Steve',
    'Dev Popp',
    'dev',
    org_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    system_role = EXCLUDED.system_role,
    organization_id = EXCLUDED.organization_id,
    updated_at = CURRENT_TIMESTAMP;

  -- Ensure organization ownership
  UPDATE organizations
  SET owner_id = steve_id
  WHERE id = org_id;

  -- Set organization role
  INSERT INTO organization_roles (
    organization_id,
    user_id,
    role
  ) VALUES (
    org_id,
    steve_id,
    'owner'
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE
  SET 
    role = 'owner',
    updated_at = CURRENT_TIMESTAMP;

  -- Set app role
  INSERT INTO organization_user_app_roles (
    organization_id,
    user_id,
    app_role,
    kitchen_role,
    permissions,
    is_active
  ) VALUES (
    org_id,
    steve_id,
    'owner',
    'owner',
    jsonb_build_object(
      'inventory', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
      'recipes', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
      'production', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
      'reports', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
      'settings', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true),
      'users', jsonb_build_object('view', true, 'create', true, 'edit', true, 'delete', true)
    ),
    true
  )
  ON CONFLICT (organization_id, user_id) DO UPDATE
  SET 
    app_role = EXCLUDED.app_role,
    kitchen_role = EXCLUDED.kitchen_role,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

  -- Clean up any duplicate or incorrect entries
  DELETE FROM organization_roles
  WHERE user_id != steve_id
  AND organization_id = org_id
  AND role = 'owner';

  DELETE FROM organization_user_app_roles
  WHERE user_id != steve_id
  AND organization_id = org_id
  AND app_role = 'owner';
END $$;