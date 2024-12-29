-- Drop and recreate locations table with proper structure
DROP TABLE IF EXISTS locations CASCADE;

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  formatted_address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  is_primary BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  UNIQUE(organization_id, name)
);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for locations
CREATE POLICY "View locations"
  ON locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = locations.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage locations"
  ON locations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = locations.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND system_role = 'dev'
    )
  );

-- Create Memphis Fire BBQ location
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  INSERT INTO locations (
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