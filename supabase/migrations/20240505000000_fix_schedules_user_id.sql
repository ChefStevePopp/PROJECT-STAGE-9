-- This migration fixes the issue with column "user_id" not existing

-- Create schedules table with correct column names
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('current', 'upcoming', 'previous')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  source TEXT NOT NULL CHECK (source IN ('csv', '7shifts', 'manual')),
  metadata JSONB
);

-- Create schedule_shifts table with employee_id instead of user_id
CREATE TABLE IF NOT EXISTS schedule_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  employee_id TEXT,
  employee_name TEXT NOT NULL,
  role TEXT,
  shift_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  break_duration NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seven_shifts_integrations table
CREATE TABLE IF NOT EXISTS seven_shifts_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  location_id TEXT,
  auto_sync BOOLEAN DEFAULT FALSE,
  sync_frequency TEXT CHECK (sync_frequency IN ('daily', 'weekly', 'manual')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seven_shifts_integrations ENABLE ROW LEVEL SECURITY;

-- Schedules policies using organization_id from JWT
DROP POLICY IF EXISTS "Users can view their organization's schedules" ON schedules;
CREATE POLICY "Users can view their organization's schedules"
  ON schedules
  FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

DROP POLICY IF EXISTS "Admins can insert schedules" ON schedules;
CREATE POLICY "Admins can insert schedules"
  ON schedules
  FOR INSERT
  WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_team_members 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND kitchen_role IN ('owner', 'chef', 'sous_chef')
    )
  );

DROP POLICY IF EXISTS "Admins can update schedules" ON schedules;
CREATE POLICY "Admins can update schedules"
  ON schedules
  FOR UPDATE
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_team_members 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND kitchen_role IN ('owner', 'chef', 'sous_chef')
    )
  );

DROP POLICY IF EXISTS "Admins can delete schedules" ON schedules;
CREATE POLICY "Admins can delete schedules"
  ON schedules
  FOR DELETE
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_team_members 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND kitchen_role IN ('owner', 'chef', 'sous_chef')
    )
  );

-- Schedule shifts policies
DROP POLICY IF EXISTS "Users can view their organization's shifts" ON schedule_shifts;
CREATE POLICY "Users can view their organization's shifts"
  ON schedule_shifts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = schedule_shifts.schedule_id
      AND schedules.organization_id = (auth.jwt() ->> 'organization_id')::uuid
    )
  );

DROP POLICY IF EXISTS "Admins can insert shifts" ON schedule_shifts;
CREATE POLICY "Admins can insert shifts"
  ON schedule_shifts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = schedule_shifts.schedule_id
      AND schedules.organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND EXISTS (
        SELECT 1 FROM organization_team_members 
        WHERE organization_id = schedules.organization_id
        AND kitchen_role IN ('owner', 'chef', 'sous_chef')
      )
    )
  );

DROP POLICY IF EXISTS "Admins can update shifts" ON schedule_shifts;
CREATE POLICY "Admins can update shifts"
  ON schedule_shifts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = schedule_shifts.schedule_id
      AND schedules.organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND EXISTS (
        SELECT 1 FROM organization_team_members 
        WHERE organization_id = schedules.organization_id
        AND kitchen_role IN ('owner', 'chef', 'sous_chef')
      )
    )
  );

DROP POLICY IF EXISTS "Admins can delete shifts" ON schedule_shifts;
CREATE POLICY "Admins can delete shifts"
  ON schedule_shifts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = schedule_shifts.schedule_id
      AND schedules.organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND EXISTS (
        SELECT 1 FROM organization_team_members 
        WHERE organization_id = schedules.organization_id
        AND kitchen_role IN ('owner', 'chef', 'sous_chef')
      )
    )
  );

-- 7shifts integration policies
DROP POLICY IF EXISTS "Users can view their organization's 7shifts integration" ON seven_shifts_integrations;
CREATE POLICY "Users can view their organization's 7shifts integration"
  ON seven_shifts_integrations
  FOR SELECT
  USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);

DROP POLICY IF EXISTS "Admins can insert 7shifts integration" ON seven_shifts_integrations;
CREATE POLICY "Admins can insert 7shifts integration"
  ON seven_shifts_integrations
  FOR INSERT
  WITH CHECK (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_team_members 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND kitchen_role IN ('owner', 'chef', 'sous_chef')
    )
  );

DROP POLICY IF EXISTS "Admins can update 7shifts integration" ON seven_shifts_integrations;
CREATE POLICY "Admins can update 7shifts integration"
  ON seven_shifts_integrations
  FOR UPDATE
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_team_members 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND kitchen_role IN ('owner', 'chef', 'sous_chef')
    )
  );

DROP POLICY IF EXISTS "Admins can delete 7shifts integration" ON seven_shifts_integrations;
CREATE POLICY "Admins can delete 7shifts integration"
  ON seven_shifts_integrations
  FOR DELETE
  USING (
    organization_id = (auth.jwt() ->> 'organization_id')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_team_members 
      WHERE organization_id = (auth.jwt() ->> 'organization_id')::uuid
      AND kitchen_role IN ('owner', 'chef', 'sous_chef')
    )
  );

-- Create storage bucket for schedules if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('schedules', 'schedules', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Public can read schedule files" ON storage.objects;
CREATE POLICY "Public can read schedule files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'schedules');

DROP POLICY IF EXISTS "Authenticated users can upload schedule files" ON storage.objects;
CREATE POLICY "Authenticated users can upload schedule files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'schedules' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own schedule files" ON storage.objects;
CREATE POLICY "Users can update their own schedule files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'schedules' AND owner = auth.uid());
