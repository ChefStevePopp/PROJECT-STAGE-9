-- Create Memphis Fire Barbeque Company organization
INSERT INTO public.organizations (id, name, slug)
VALUES (
  'org_memphis_fire',
  'Memphis Fire Barbeque Company Inc.',
  'memphis-fire-bbq'
) ON CONFLICT (id) DO NOTHING;

-- Create dev user profile for Steve
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
VALUES (
  'user_steve',
  'office@memphisfirebbq.com',
  crypt('MFBC2024[Spencer]!', gen_salt('bf')),
  now(),
  jsonb_build_object(
    'firstName', 'Steve',
    'lastName', 'Popp',
    'role', 'dev',
    'system_role', 'dev'
  )
) ON CONFLICT (email) DO UPDATE
SET 
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  email_confirmed_at = EXCLUDED.email_confirmed_at;

-- Create profile entry
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  role,
  organization_id
)
VALUES (
  'user_steve',
  'Steve',
  'Popp',
  'dev',
  'org_memphis_fire'
) ON CONFLICT (id) DO UPDATE
SET 
  role = 'dev',
  organization_id = 'org_memphis_fire';

-- Create organization membership
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  role
)
VALUES (
  'org_memphis_fire',
  'user_steve',
  'owner'
) ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = 'owner';