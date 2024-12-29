-- Create master_ingredients table
CREATE TABLE master_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unique_id TEXT NOT NULL,
  category TEXT NOT NULL,
  product TEXT NOT NULL,
  vendor TEXT NOT NULL,
  sub_category TEXT,
  item_code TEXT,
  case_size TEXT,
  units_per_case TEXT,
  current_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_of_measure TEXT NOT NULL,
  ratio_per_unit DECIMAL(10,3) NOT NULL DEFAULT 0,
  yield_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
  price_per_ratio_unit DECIMAL(10,4) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, unique_id)
);

-- Enable RLS
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view ingredients in their organization"
  ON master_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage ingredients"
  ON master_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
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
CREATE INDEX master_ingredients_organization_id_idx ON master_ingredients(organization_id);
CREATE INDEX master_ingredients_category_idx ON master_ingredients(category);
CREATE INDEX master_ingredients_product_idx ON master_ingredients(product);
CREATE INDEX master_ingredients_vendor_idx ON master_ingredients(vendor);

-- Create trigger for updated_at
CREATE TRIGGER update_master_ingredients_updated_at
  BEFORE UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data for recipe and inventory management';
COMMENT ON COLUMN master_ingredients.unique_id IS 'External unique identifier from import source';
COMMENT ON COLUMN master_ingredients.yield_percent IS 'Yield percentage (1-100)';
COMMENT ON COLUMN master_ingredients.price_per_ratio_unit IS 'Calculated price per recipe unit';
