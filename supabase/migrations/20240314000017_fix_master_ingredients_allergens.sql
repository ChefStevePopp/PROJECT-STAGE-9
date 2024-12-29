-- Drop and recreate master_ingredients table with proper allergen columns
DROP TABLE IF EXISTS master_ingredients CASCADE;

CREATE TABLE master_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  major_group UUID,
  category UUID,
  sub_category UUID,
  product TEXT NOT NULL,
  vendor TEXT NOT NULL,
  case_size TEXT,
  units_per_case TEXT,
  current_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_of_measure TEXT NOT NULL,
  recipe_unit_per_purchase_unit DECIMAL(10,3) NOT NULL DEFAULT 0,
  recipe_unit_type TEXT,
  yield_percent DECIMAL(5,2) NOT NULL DEFAULT 100,
  cost_per_recipe_unit DECIMAL(10,4) NOT NULL DEFAULT 0,
  image_url TEXT,
  storage_area TEXT,
  
  -- Allergen columns
  allergen_peanut BOOLEAN NOT NULL DEFAULT false,
  allergen_crustacean BOOLEAN NOT NULL DEFAULT false,
  allergen_treenut BOOLEAN NOT NULL DEFAULT false,
  allergen_shellfish BOOLEAN NOT NULL DEFAULT false,
  allergen_sesame BOOLEAN NOT NULL DEFAULT false,
  allergen_soy BOOLEAN NOT NULL DEFAULT false,
  allergen_fish BOOLEAN NOT NULL DEFAULT false,
  allergen_wheat BOOLEAN NOT NULL DEFAULT false,
  allergen_milk BOOLEAN NOT NULL DEFAULT false,
  allergen_sulphite BOOLEAN NOT NULL DEFAULT false,
  allergen_egg BOOLEAN NOT NULL DEFAULT false,
  allergen_gluten BOOLEAN NOT NULL DEFAULT false,
  allergen_mustard BOOLEAN NOT NULL DEFAULT false,
  allergen_celery BOOLEAN NOT NULL DEFAULT false,
  allergen_garlic BOOLEAN NOT NULL DEFAULT false,
  allergen_onion BOOLEAN NOT NULL DEFAULT false,
  allergen_nitrite BOOLEAN NOT NULL DEFAULT false,
  allergen_mushroom BOOLEAN NOT NULL DEFAULT false,
  allergen_hot_pepper BOOLEAN NOT NULL DEFAULT false,
  allergen_citrus BOOLEAN NOT NULL DEFAULT false,
  allergen_pork BOOLEAN NOT NULL DEFAULT false,
  
  -- Custom allergen fields
  allergen_custom1_name TEXT,
  allergen_custom1_active BOOLEAN DEFAULT false,
  allergen_custom2_name TEXT,
  allergen_custom2_active BOOLEAN DEFAULT false,
  allergen_custom3_name TEXT,
  allergen_custom3_active BOOLEAN DEFAULT false,
  allergen_notes TEXT,

  -- Constraints
  UNIQUE(organization_id, item_code),
  FOREIGN KEY (major_group, organization_id) REFERENCES food_category_groups(id, organization_id) ON DELETE SET NULL,
  FOREIGN KEY (category, organization_id) REFERENCES food_categories(id, organization_id) ON DELETE SET NULL,
  FOREIGN KEY (sub_category, organization_id) REFERENCES food_sub_categories(id, organization_id) ON DELETE SET NULL
);

-- Create master_ingredients_with_categories view
CREATE OR REPLACE VIEW master_ingredients_with_categories AS
SELECT 
  mi.*,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name
FROM master_ingredients mi
LEFT JOIN food_category_groups fcg ON fcg.id = mi.major_group 
  AND fcg.organization_id = mi.organization_id
LEFT JOIN food_categories fc ON fc.id = mi.category 
  AND fc.organization_id = mi.organization_id
LEFT JOIN food_sub_categories fsc ON fsc.id = mi.sub_category 
  AND fsc.organization_id = mi.organization_id;

-- Create simplified RLS policies
CREATE POLICY "View master ingredients"
  ON master_ingredients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage master ingredients"
  ON master_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = master_ingredients.organization_id::text
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_master_ingredients_org_id ON master_ingredients(organization_id);
CREATE INDEX idx_master_ingredients_item_code ON master_ingredients(item_code);
CREATE INDEX idx_master_ingredients_major_group ON master_ingredients(major_group);
CREATE INDEX idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX idx_master_ingredients_sub_category ON master_ingredients(sub_category);

-- Add trigger for updated_at
CREATE TRIGGER update_master_ingredients_updated_at
  BEFORE UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;
GRANT ALL ON master_ingredients TO authenticated;

-- Add helpful comments
COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data including allergen information';
COMMENT ON VIEW master_ingredients_with_categories IS 'View that includes resolved category names for master ingredients';