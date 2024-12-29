-- Create inventory_counts table that references master_ingredients
CREATE TABLE inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  master_ingredient_id UUID NOT NULL REFERENCES master_ingredients(id) ON DELETE CASCADE,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  location TEXT,
  counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'verified')) DEFAULT 'pending',
  UNIQUE(organization_id, master_ingredient_id, count_date)
);

-- Enable RLS
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view inventory counts in their organization"
  ON inventory_counts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = inventory_counts.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage inventory counts"
  ON inventory_counts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = inventory_counts.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin', 'manager', 'staff')
    )
  );

-- Create indexes
CREATE INDEX inventory_counts_organization_id_idx ON inventory_counts(organization_id);
CREATE INDEX inventory_counts_master_ingredient_id_idx ON inventory_counts(master_ingredient_id);
CREATE INDEX inventory_counts_count_date_idx ON inventory_counts(count_date);

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