-- Create initial organization
INSERT INTO public.organizations (id, name, slug)
VALUES (
  'org_default',
  'Demo Restaurant',
  'demo-restaurant'
) ON CONFLICT DO NOTHING;

-- Create initial user profile
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  organization_id
)
SELECT 
  auth.uid(),
  'Admin',
  'User',
  'owner',
  'org_default'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'owner',
  organization_id = 'org_default';

-- Create organization membership
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role
)
SELECT 
  'org_default',
  auth.uid(),
  'owner'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = 'owner';