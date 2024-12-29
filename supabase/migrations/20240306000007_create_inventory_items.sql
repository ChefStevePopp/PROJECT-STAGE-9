-- Create inventory_items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL,
  case_size TEXT,
  units_per_case TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  adjusted_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  yield_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, item_id)
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view inventory items in their organization"
  ON inventory_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = inventory_items.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage inventory items"
  ON inventory_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = inventory_items.organization_id
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

-- Create indexes
CREATE INDEX inventory_items_organization_id_idx ON inventory_items(organization_id);
CREATE INDEX inventory_items_category_idx ON inventory_items(category);
CREATE INDEX inventory_items_product_name_idx ON inventory_items(product_name);
CREATE INDEX inventory_items_vendor_idx ON inventory_items(vendor);

-- Create trigger for updated_at
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE inventory_items IS 'Stores inventory items with pricing information';
COMMENT ON COLUMN inventory_items.item_id IS 'External unique identifier from import source';
COMMENT ON COLUMN inventory_items.yield_percent IS 'Yield percentage (1-100)';