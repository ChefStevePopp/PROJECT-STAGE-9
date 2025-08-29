CREATE TABLE IF NOT EXISTS haccp_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('fridge', 'freezer', 'hot_holding', 'cold_holding')),
  location_name TEXT NOT NULL,
  station_assignment TEXT,
  sensor_id TEXT REFERENCES sensorpush_sensors(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Enable RLS
ALTER TABLE haccp_equipment ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view equipment for their organization" ON haccp_equipment
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert equipment for their organization" ON haccp_equipment
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update equipment for their organization" ON haccp_equipment
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete equipment for their organization" ON haccp_equipment
  FOR DELETE USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE haccp_equipment;

-- Create indexes
CREATE INDEX idx_haccp_equipment_organization_id ON haccp_equipment(organization_id);
CREATE INDEX idx_haccp_equipment_type ON haccp_equipment(equipment_type);
CREATE INDEX idx_haccp_equipment_active ON haccp_equipment(is_active);
