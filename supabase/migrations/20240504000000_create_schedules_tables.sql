-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('current', 'upcoming', 'previous')),
  created_by UUID REFERENCES auth.users(id),
  source TEXT NOT NULL CHECK (source IN ('csv', '7shifts', 'manual')),
  metadata JSONB
);

-- Create schedule_shifts table
CREATE TABLE IF NOT EXISTS schedule_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  employee_id TEXT,
  employee_name TEXT NOT NULL,
  role TEXT,
  shift_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  break_duration NUMERIC DEFAULT 0,
  notes TEXT
);

-- Create 7shifts integration table
CREATE TABLE IF NOT EXISTS seven_shifts_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  api_key TEXT NOT NULL,
  location_id TEXT,
  auto_sync BOOLEAN DEFAULT FALSE,
  sync_frequency TEXT CHECK (sync_frequency IN ('daily', 'weekly', 'manual')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seven_shifts_integrations ENABLE ROW LEVEL SECURITY;

-- Organization members can view schedules
CREATE POLICY "Organization members can view schedules"
  ON schedules FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid()
  ));

-- Organization admins can insert/update/delete schedules
CREATE POLICY "Organization admins can insert schedules"
  ON schedules FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

CREATE POLICY "Organization admins can update schedules"
  ON schedules FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

CREATE POLICY "Organization admins can delete schedules"
  ON schedules FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

-- Organization members can view shifts
CREATE POLICY "Organization members can view shifts"
  ON schedule_shifts FOR SELECT
  USING (schedule_id IN (
    SELECT id FROM schedules
    WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members
      WHERE user_id = auth.uid()
    )
  ));

-- Organization admins can insert/update/delete shifts
CREATE POLICY "Organization admins can insert shifts"
  ON schedule_shifts FOR INSERT
  WITH CHECK (schedule_id IN (
    SELECT id FROM schedules
    WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  ));

CREATE POLICY "Organization admins can update shifts"
  ON schedule_shifts FOR UPDATE
  USING (schedule_id IN (
    SELECT id FROM schedules
    WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  ));

CREATE POLICY "Organization admins can delete shifts"
  ON schedule_shifts FOR DELETE
  USING (schedule_id IN (
    SELECT id FROM schedules
    WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  ));

-- Organization admins can manage 7shifts integrations
CREATE POLICY "Organization admins can view 7shifts integrations"
  ON seven_shifts_integrations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

CREATE POLICY "Organization admins can insert 7shifts integrations"
  ON seven_shifts_integrations FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

CREATE POLICY "Organization admins can update 7shifts integrations"
  ON seven_shifts_integrations FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

CREATE POLICY "Organization admins can delete 7shifts integrations"
  ON seven_shifts_integrations FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
  ));

-- Create storage bucket for schedule files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('schedules', 'schedules', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to schedule files
CREATE POLICY "Public access to schedule files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'schedules');

-- Allow organization admins to upload schedule files
CREATE POLICY "Organization admins can upload schedule files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'schedules' AND
    (auth.uid() IN (
      SELECT user_id FROM organization_team_members
      WHERE role IN ('owner', 'admin', 'manager')
    ))
  );

-- Enable realtime for schedules and shifts
ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE schedule_shifts;
