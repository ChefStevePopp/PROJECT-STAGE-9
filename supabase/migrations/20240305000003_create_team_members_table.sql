-- Create team_members table with organization and location relationships
CREATE TABLE team_members (
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
  assigned_locations UUID[] DEFAULT '{}', -- References multiple locations
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

-- Create team_member_locations junction table for detailed location assignments
CREATE TABLE team_member_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  role TEXT,
  department TEXT,
  UNIQUE(team_member_id, location_id)
);

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Users can view team members in their organization"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = team_members.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Location managers can view their team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM location_members lm
      WHERE lm.location_id = ANY(team_members.assigned_locations)
      AND lm.user_id = auth.uid()
      AND lm.role = 'manager'
    )
  );

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = team_members.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Create policies for team_member_locations
CREATE POLICY "Users can view team member locations in their organization"
  ON team_member_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN organization_roles om ON om.organization_id = tm.organization_id
      WHERE tm.id = team_member_locations.team_member_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage team member locations"
  ON team_member_locations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      JOIN organization_roles om ON om.organization_id = tm.organization_id
      WHERE tm.id = team_member_locations.team_member_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Create functions to handle timestamp updates
CREATE OR REPLACE FUNCTION handle_team_member_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION handle_team_member_location_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_team_member_updated();

CREATE TRIGGER team_member_locations_updated_at
  BEFORE UPDATE ON team_member_locations
  FOR EACH ROW
  EXECUTE FUNCTION handle_team_member_location_updated();