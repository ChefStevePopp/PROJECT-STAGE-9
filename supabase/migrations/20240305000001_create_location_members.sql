-- Create location_members table
CREATE TABLE location_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('manager', 'staff')),
  departments TEXT[] DEFAULT '{}',
  is_primary BOOLEAN DEFAULT false,
  UNIQUE(location_id, user_id)
);

-- Enable RLS
ALTER TABLE location_members ENABLE ROW LEVEL SECURITY;

-- Create policies for location_members
CREATE POLICY "Users can view location members"
  ON location_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM locations l
      JOIN organization_members om ON om.organization_id = l.organization_id
      WHERE l.id = location_members.location_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Location managers can manage their members"
  ON location_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM location_members lm
      WHERE lm.location_id = location_members.location_id
      AND lm.user_id = auth.uid()
      AND lm.role = 'manager'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_location_members_updated_at
  BEFORE UPDATE ON location_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();