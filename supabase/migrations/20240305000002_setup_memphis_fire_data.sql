-- Set up Memphis Fire BBQ Company organization and location
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'::uuid;
  owner_id uuid;
BEGIN
  -- Get Steve's user ID
  SELECT id INTO owner_id
  FROM auth.users
  WHERE email = 'office@memphisfirebbq.com';

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Owner user not found';
  END IF;

  -- Create or update the organization
  INSERT INTO public.organizations (
    id,
    name,
    slug,
    owner_id,
    settings
  )
  VALUES (
    org_id,
    'Memphis Fire Barbeque Company Inc.',
    'memphis-fire-bbq',
    owner_id,
    jsonb_build_object(
      'business_type', 'restaurant',
      'default_timezone', 'America/Toronto',
      'multi_unit', false,
      'currency', 'CAD',
      'date_format', 'MM/DD/YYYY',
      'time_format', '12h'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    owner_id = EXCLUDED.owner_id,
    settings = EXCLUDED.settings,
    updated_at = CURRENT_TIMESTAMP;

  -- Create or update the primary location
  INSERT INTO public.locations (
    organization_id,
    name,
    address,
    formatted_address,
    city,
    state,
    postal_code,
    country,
    timezone,
    is_primary,
    settings
  )
  VALUES (
    org_id,
    'Main Location',
    '1091 Hwy 8',
    '1091 Hwy 8, Winona, Ontario L8E 1L6, Canada',
    'Winona',
    'Ontario',
    'L8E 1L6',
    'Canada',
    'America/Toronto',
    true,
    jsonb_build_object(
      'pos_system', null,
      'scheduling_system', null,
      'inventory_system', null
    )
  )
  ON CONFLICT (organization_id, name) DO UPDATE
  SET 
    address = EXCLUDED.address,
    formatted_address = EXCLUDED.formatted_address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    country = EXCLUDED.country,
    timezone = EXCLUDED.timezone,
    is_primary = EXCLUDED.is_primary,
    settings = EXCLUDED.settings,
    updated_at = CURRENT_TIMESTAMP;

END $$;