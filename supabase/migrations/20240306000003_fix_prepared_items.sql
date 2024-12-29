-- Drop and recreate prepared_items table with complete structure
DROP TABLE IF EXISTS prepared_items CASCADE;

CREATE TABLE prepared_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  category TEXT NOT NULL,
  product TEXT NOT NULL,
  station TEXT NOT NULL,
  sub_category TEXT,
  storage_area TEXT,
  container TEXT,
  container_type TEXT,
  shelf_life TEXT,
  recipe_unit_ratio TEXT,
  cost_per_ratio_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  yield_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
  final_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Allergen columns
  allergen_peanut BOOLEAN DEFAULT false,
  allergen_crustacean BOOLEAN DEFAULT false,
  allergen_treenut BOOLEAN DEFAULT false,
  allergen_shellfish BOOLEAN DEFAULT false,
  allergen_sesame BOOLEAN DEFAULT false,
  allergen_soy BOOLEAN DEFAULT false,
  allergen_fish BOOLEAN DEFAULT false,
  allergen_wheat BOOLEAN DEFAULT false,
  allergen_milk BOOLEAN DEFAULT false,
  allergen_sulphite BOOLEAN DEFAULT false,
  allergen_egg BOOLEAN DEFAULT false,
  allergen_gluten BOOLEAN DEFAULT false,
  allergen_mustard BOOLEAN DEFAULT false,
  allergen_celery BOOLEAN DEFAULT false,
  allergen_garlic BOOLEAN DEFAULT false,
  allergen_onion BOOLEAN DEFAULT false,
  allergen_nitrite BOOLEAN DEFAULT false,
  allergen_mushroom BOOLEAN DEFAULT false,
  allergen_hot_pepper BOOLEAN DEFAULT false,
  allergen_citrus BOOLEAN DEFAULT false,
  allergen_pork BOOLEAN DEFAULT false,
  
  -- Custom allergen fields for future use
  allergen_custom1 BOOLEAN DEFAULT false,
  allergen_custom2 BOOLEAN DEFAULT false,
  allergen_custom3 BOOLEAN DEFAULT false,
  allergen_notes TEXT,

  -- Timestamps and constraints
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, item_id)
);

-- Enable RLS
ALTER TABLE prepared_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view prepared items in their organization"
  ON prepared_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = prepared_items.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage prepared items"
  ON prepared_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = prepared_items.organization_id
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

-- Create indexes for performance
CREATE INDEX prepared_items_organization_id_idx ON prepared_items(organization_id);
CREATE INDEX prepared_items_category_idx ON prepared_items(category);
CREATE INDEX prepared_items_product_idx ON prepared_items(product);
CREATE INDEX prepared_items_station_idx ON prepared_items(station);

-- Create trigger for updated_at
CREATE TRIGGER update_prepared_items_updated_at
  BEFORE UPDATE ON prepared_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE prepared_items IS 'Stores prepared item recipes and specifications including allergen information';
COMMENT ON COLUMN prepared_items.item_id IS 'External unique identifier from import source';
COMMENT ON COLUMN prepared_items.yield_percent IS 'Yield percentage (1-100)';
COMMENT ON COLUMN prepared_items.allergen_notes IS 'Additional notes about allergens or special handling requirements';