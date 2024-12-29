-- Create operations_settings table
CREATE TABLE operations_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Storage and Location Settings
  storage_areas TEXT[] DEFAULT '{}',
  kitchen_stations TEXT[] DEFAULT '{}',
  shelf_life_options TEXT[] DEFAULT '{}',
  storage_containers TEXT[] DEFAULT '{}',
  container_types TEXT[] DEFAULT '{}',
  
  -- Measurement Units
  alcohol_measures TEXT[] DEFAULT '{}',
  volume_measures TEXT[] DEFAULT '{}',
  weight_measures TEXT[] DEFAULT '{}',
  dry_goods_measures TEXT[] DEFAULT '{}',
  recipe_unit_measures TEXT[] DEFAULT '{}',
  protein_measures TEXT[] DEFAULT '{}',
  batch_units TEXT[] DEFAULT '{}',
  
  -- Categories and Classifications
  mise_en_place_categories TEXT[] DEFAULT '{}',
  ingredient_categories TEXT[] DEFAULT '{}',
  ingredient_sub_categories TEXT[] DEFAULT '{}',
  
  -- Business Operations
  revenue_channels TEXT[] DEFAULT '{}',
  pos_major_groups TEXT[] DEFAULT '{}',
  pos_family_groups TEXT[] DEFAULT '{}',
  vendors TEXT[] DEFAULT '{}',
  
  -- Metadata
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one settings record per organization
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE operations_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view operations settings in their organization"
  ON operations_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = operations_settings.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage operations settings"
  ON operations_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = operations_settings.organization_id
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

-- Create trigger for updated_at
CREATE TRIGGER update_operations_settings_updated_at
  BEFORE UPDATE ON operations_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE operations_settings IS 'Stores organization-wide operational settings and lookup values';

-- Insert default settings for Memphis Fire BBQ
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  INSERT INTO operations_settings (
    organization_id,
    storage_areas,
    kitchen_stations,
    shelf_life_options,
    storage_containers,
    container_types,
    alcohol_measures,
    volume_measures,
    weight_measures,
    dry_goods_measures,
    recipe_unit_measures,
    protein_measures,
    batch_units,
    mise_en_place_categories,
    ingredient_categories,
    ingredient_sub_categories,
    revenue_channels,
    pos_major_groups,
    pos_family_groups,
    vendors
  ) VALUES (
    org_id,
    ARRAY['Walk-in Cooler', 'Walk-in Freezer', 'Dry Storage', 'Line Cooler', 'Prep Station'],
    ARRAY['Grill', 'Smoker', 'Fryer', 'Prep', 'Line', 'Expo'],
    ARRAY['1 Day', '2 Days', '3 Days', '5 Days', '1 Week', '2 Weeks', '1 Month'],
    ARRAY['Cambro', 'Hotel Pan', 'Lexan', 'Sheet Pan', 'Deli Container'],
    ARRAY['1/6 Pan', '1/4 Pan', '1/3 Pan', '1/2 Pan', 'Full Pan', '2 Qt', '4 Qt', '6 Qt', '8 Qt', '12 Qt', '22 Qt'],
    ARRAY['oz', 'ml', 'L', 'gal'],
    ARRAY['ml', 'L', 'fl oz', 'cup', 'pint', 'quart', 'gallon'],
    ARRAY['g', 'kg', 'oz', 'lb'],
    ARRAY['cup', 'tbsp', 'tsp', 'pinch'],
    ARRAY['portion', 'serving', 'each', 'dozen', 'batch'],
    ARRAY['oz', 'lb', 'portion', 'piece'],
    ARRAY['Each', 'Batch', 'Recipe', 'Pan', 'Sheet', 'Container'],
    ARRAY['Sauces', 'Marinades', 'Seasonings', 'Vegetables', 'Proteins', 'Starches'],
    ARRAY['Meat', 'Poultry', 'Seafood', 'Produce', 'Dairy', 'Dry Goods', 'Beverages', 'Paper Goods'],
    ARRAY['Fresh', 'Frozen', 'Canned', 'Dried', 'Processed', 'Raw'],
    ARRAY['Dine-In', 'Take-Out', 'Delivery', 'Catering', 'Events'],
    ARRAY['Food', 'Beverage', 'Alcohol', 'Merchandise'],
    ARRAY['BBQ', 'Sides', 'Desserts', 'Drinks', 'Retail'],
    ARRAY['US Foods', 'Sysco', 'Gordon Food Service', 'Performance Food Group', 'Local Suppliers']
  )
  ON CONFLICT (organization_id) DO UPDATE
  SET
    storage_areas = EXCLUDED.storage_areas,
    kitchen_stations = EXCLUDED.kitchen_stations,
    shelf_life_options = EXCLUDED.shelf_life_options,
    storage_containers = EXCLUDED.storage_containers,
    container_types = EXCLUDED.container_types,
    alcohol_measures = EXCLUDED.alcohol_measures,
    volume_measures = EXCLUDED.volume_measures,
    weight_measures = EXCLUDED.weight_measures,
    dry_goods_measures = EXCLUDED.dry_goods_measures,
    recipe_unit_measures = EXCLUDED.recipe_unit_measures,
    protein_measures = EXCLUDED.protein_measures,
    batch_units = EXCLUDED.batch_units,
    mise_en_place_categories = EXCLUDED.mise_en_place_categories,
    ingredient_categories = EXCLUDED.ingredient_categories,
    ingredient_sub_categories = EXCLUDED.ingredient_sub_categories,
    revenue_channels = EXCLUDED.revenue_channels,
    pos_major_groups = EXCLUDED.pos_major_groups,
    pos_family_groups = EXCLUDED.pos_family_groups,
    vendors = EXCLUDED.vendors,
    updated_at = CURRENT_TIMESTAMP;
END $$;