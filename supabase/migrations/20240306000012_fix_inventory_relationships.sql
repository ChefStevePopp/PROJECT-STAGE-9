-- Drop and recreate inventory_counts table with proper foreign key relationship
DROP TABLE IF EXISTS inventory_counts CASCADE;

CREATE TABLE inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  master_ingredient_id UUID NOT NULL,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  location TEXT,
  counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'verified')) DEFAULT 'pending',
  CONSTRAINT inventory_counts_master_ingredient_fk 
    FOREIGN KEY (master_ingredient_id, organization_id) 
    REFERENCES master_ingredients(id, organization_id) 
    ON DELETE CASCADE,
  UNIQUE(organization_id, master_ingredient_id, count_date)
);

-- Enable RLS
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View inventory counts"
  ON inventory_counts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = inventory_counts.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage inventory counts"
  ON inventory_counts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = inventory_counts.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'staff')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND system_role = 'dev'
    )
  );

-- Create indexes
CREATE INDEX idx_inventory_counts_org_id ON inventory_counts(organization_id);
CREATE INDEX idx_inventory_counts_ingredient_id ON inventory_counts(master_ingredient_id);
CREATE INDEX idx_inventory_counts_date ON inventory_counts(count_date);

-- Create trigger for updated_at
CREATE TRIGGER update_inventory_counts_updated_at
  BEFORE UPDATE ON inventory_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE inventory_counts IS 'Stores inventory count history linked to master ingredients';
COMMENT ON COLUMN inventory_counts.quantity IS 'Quantity counted in ingredient''s unit of measure';
COMMENT ON COLUMN inventory_counts.unit_cost IS 'Cost per unit at time of count';
COMMENT ON COLUMN inventory_counts.total_value IS 'Calculated total value of counted inventory';