-- First ensure the organization exists
INSERT INTO organizations (
  id,
  name,
  owner_id,
  settings
)
SELECT 
  'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
  'Memphis Fire Barbeque Company Inc.',
  (SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'),
  jsonb_build_object(
    'business_type', 'restaurant',
    'cuisine_type', 'BBQ',
    'default_timezone', 'America/Toronto',
    'multi_unit', false,
    'currency', 'CAD',
    'date_format', 'MM/DD/YYYY',
    'time_format', '12h',
    'operating_schedule', jsonb_build_object(
      'Monday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '20:00')),
      'Tuesday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '20:00')),
      'Wednesday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '20:00')),
      'Thursday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '20:00')),
      'Friday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '21:00')),
      'Saturday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '21:00')),
      'Sunday', jsonb_build_array(jsonb_build_object('open', '11:00', 'close', '20:00'))
    )
  )
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  owner_id = EXCLUDED.owner_id,
  settings = EXCLUDED.settings,
  updated_at = CURRENT_TIMESTAMP;

-- Ensure Steve has the correct metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';

-- Ensure Steve has owner role in organization_roles
INSERT INTO organization_roles (
  organization_id,
  user_id,
  role
)
SELECT 
  'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
  id,
  'owner'
FROM auth.users 
WHERE email = 'office@memphisfirebbq.com'
ON CONFLICT (organization_id, user_id) 
DO UPDATE SET 
  role = 'owner',
  updated_at = CURRENT_TIMESTAMP;

-- Add helpful comments
COMMENT ON TABLE organizations IS 'Organizations table with proper ownership and settings';
COMMENT ON TABLE organization_roles IS 'Organization roles with proper user relationships';