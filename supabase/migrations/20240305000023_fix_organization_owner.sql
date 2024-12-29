-- Fix the foreign key relationship for organization owner
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_owner_fk;

ALTER TABLE organizations
ADD CONSTRAINT organizations_owner_fk 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Update Memphis Fire BBQ organization
DO $$
DECLARE
  steve_id uuid;
BEGIN
  -- Get Steve's user ID
  SELECT id INTO steve_id
  FROM auth.users
  WHERE email = 'office@memphisfirebbq.com';

  IF steve_id IS NOT NULL THEN
    -- Update organization owner
    UPDATE organizations
    SET 
      owner_id = steve_id,
      settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object(
        'business_type', 'restaurant',
        'cuisine_type', 'BBQ',
        'default_timezone', 'America/Toronto',
        'multi_unit', false,
        'currency', 'CAD',
        'date_format', 'MM/DD/YYYY',
        'time_format', '12h'
      )
    WHERE id = 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
  END IF;
END $$;