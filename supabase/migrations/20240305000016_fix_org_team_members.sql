-- Drop and recreate organization_team_members table with proper structure
DROP TABLE IF EXISTS organization_team_members CASCADE;

CREATE TABLE organization_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  primary_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  punch_id TEXT,
  avatar_url TEXT,
  roles TEXT[] DEFAULT '{}',
  departments TEXT[] DEFAULT '{}',
  assigned_locations UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'seasonal', 'temporary')),
  hire_date DATE,
  notification_preferences JSONB DEFAULT '{
    "mobile": true,
    "email": true,
    "schedule_updates": true,
    "team_messages": true,
    "prep_tasks": true
  }'::jsonb,
  emergency_contact JSONB DEFAULT '{
    "name": null,
    "phone": null,
    "relationship": null
  }'::jsonb,
  certifications JSONB[] DEFAULT '{}',
  UNIQUE(organization_id, email),
  UNIQUE(organization_id, punch_id)
);

-- Enable RLS
ALTER TABLE organization_team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View team members"
  ON organization_team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = organization_team_members.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage team members"
  ON organization_team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = organization_team_members.organization_id
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