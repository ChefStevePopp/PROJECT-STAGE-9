-- Create vendor_imports table to track import history
CREATE TABLE IF NOT EXISTS vendor_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  vendor_id TEXT NOT NULL,
  import_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  items_count INTEGER NOT NULL DEFAULT 0,
  price_changes INTEGER NOT NULL DEFAULT 0,
  new_items INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE vendor_imports ENABLE ROW LEVEL SECURITY;

-- Allow users to select their organization's imports
CREATE POLICY "Users can view their organization's imports"
  ON vendor_imports
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert imports for their organization
CREATE POLICY "Users can insert imports for their organization"
  ON vendor_imports
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

-- Allow users to update their organization's imports
CREATE POLICY "Users can update their organization's imports"
  ON vendor_imports
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

-- Allow users to delete their organization's imports
CREATE POLICY "Users can delete their organization's imports"
  ON vendor_imports
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  );

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_imports;
