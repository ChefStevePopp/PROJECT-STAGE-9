-- Create CSV mappings table for persistent storage of schedule import configurations
CREATE TABLE IF NOT EXISTS csv_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);

-- Add RLS policies
ALTER TABLE csv_mappings ENABLE ROW LEVEL SECURITY;

-- Allow users to select their organization's mappings
CREATE POLICY "Users can view their organization's CSV mappings"
  ON csv_mappings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert mappings for their organization
CREATE POLICY "Users can insert CSV mappings for their organization"
  ON csv_mappings
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to update mappings for their organization
CREATE POLICY "Users can update their organization's CSV mappings"
  ON csv_mappings
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to delete mappings for their organization
CREATE POLICY "Users can delete their organization's CSV mappings"
  ON csv_mappings
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE csv_mappings;
