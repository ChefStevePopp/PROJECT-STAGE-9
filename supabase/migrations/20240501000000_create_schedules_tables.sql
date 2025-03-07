-- Create schedules table
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

-- Create schedule_shifts table
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

-- Schedules policies
CREATE POLICY "Users can view their organization's schedules"
  ON schedules
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert schedules"
  ON schedules
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Admins can update schedules"
  ON schedules
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Schedule shifts policies
CREATE POLICY "Users can view their organization's shifts"
  ON schedule_shifts
  FOR SELECT
  USING (schedule_id IN (
    SELECT id FROM schedules WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Admins can insert shifts"
  ON schedule_shifts
  FOR INSERT
  WITH CHECK (schedule_id IN (
    SELECT id FROM schedules WHERE organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  ));

CREATE POLICY "Admins can update shifts"
  ON schedule_shifts
  FOR UPDATE
  USING (schedule_id IN (
    SELECT id FROM schedules WHERE organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  ));

-- 7shifts integration policies
CREATE POLICY "Users can view their organization's 7shifts integration"
  ON seven_shifts_integrations
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can insert 7shifts integration"
  ON seven_shifts_integrations
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Admins can update 7shifts integration"
  ON seven_shifts_integrations
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Create storage bucket for schedules
INSERT INTO storage.buckets (id, name, public) 
VALUES ('schedules', 'schedules', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Public can read schedule files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'schedules');

CREATE POLICY "Authenticated users can upload schedule files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'schedules' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own schedule files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'schedules' AND owner = auth.uid());
