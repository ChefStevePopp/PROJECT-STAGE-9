-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- First update the existing user's metadata
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_build_object(
    'firstName', 'Steve',
    'lastName', 'Popp',
    'role', 'dev',
    'system_role', 'dev',
    'organization_name', 'Memphis Fire Barbeque Company Inc.'
  ),
  email_confirmed_at = now()
WHERE email = 'office@memphisfirebbq.com';

-- Then create/update the organization
INSERT INTO public.organizations (
  id,
  name,
  slug,
  owner_id
)
VALUES (
  'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
  'Memphis Fire Barbeque Company Inc.',
  'memphis-fire-bbq',
  (SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com')
)
ON CONFLICT (id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  owner_id = EXCLUDED.owner_id;

-- Create/update profile entry
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  organization_id
)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'),
  'Steve',
  'Popp',
  'dev',
  'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
ON CONFLICT (id)
DO UPDATE SET 
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  organization_id = EXCLUDED.organization_id;

-- Create/update organization membership
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role
)
VALUES (
  'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e',
  (SELECT id FROM auth.users WHERE email = 'office@memphisfirebbq.com'),
  'owner'
)
ON CONFLICT (organization_id, user_id)
DO UPDATE SET role = EXCLUDED.role;