-- Drop and recreate tables with proper constraints
DROP TABLE IF EXISTS inventory_counts CASCADE;
DROP TABLE IF EXISTS master_ingredients CASCADE;
DROP TABLE IF EXISTS food_sub_categories CASCADE;
DROP TABLE IF EXISTS food_categories CASCADE;
DROP TABLE IF EXISTS food_category_groups CASCADE;

-- Create food_category_groups table
CREATE TABLE food_category_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(id, organization_id),
  UNIQUE(organization_id, name)
);

-- Create food_categories table
CREATE TABLE food_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  group_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (group_id, organization_id) REFERENCES food_category_groups(id, organization_id) ON DELETE CASCADE,
  UNIQUE(id, organization_id),
  UNIQUE(organization_id, group_id, name)
);

-- Create food_sub_categories table
CREATE TABLE food_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (category_id, organization_id) REFERENCES food_categories(id, organization_id) ON DELETE CASCADE,
  UNIQUE(id, organization_id),
  UNIQUE(organization_id, category_id, name)
);

-- Create master_ingredients table
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
  UNIQUE(id, organization_id),
  UNIQUE(organization_id, item_code),
  FOREIGN KEY (major_group, organization_id) REFERENCES food_category_groups(id, organization_id) ON DELETE SET NULL,
  FOREIGN KEY (category, organization_id) REFERENCES food_categories(id, organization_id) ON DELETE SET NULL,
  FOREIGN KEY (sub_category, organization_id) REFERENCES food_sub_categories(id, organization_id) ON DELETE SET NULL
);

-- Create inventory_counts table
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
  FOREIGN KEY (master_ingredient_id, organization_id) 
    REFERENCES master_ingredients(id, organization_id) 
    ON DELETE CASCADE,
  UNIQUE(organization_id, master_ingredient_id, count_date)
);

-- Create views
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

CREATE OR REPLACE VIEW inventory_counts_with_ingredients AS
SELECT 
  ic.*,
  mi.item_code,
  mi.product,
  mi.unit_of_measure,
  mi.image_url,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name
FROM inventory_counts ic
JOIN master_ingredients mi ON mi.id = ic.master_ingredient_id 
  AND mi.organization_id = ic.organization_id
LEFT JOIN food_category_groups fcg ON fcg.id = mi.major_group 
  AND fcg.organization_id = mi.organization_id
LEFT JOIN food_categories fc ON fc.id = mi.category 
  AND fc.organization_id = mi.organization_id
LEFT JOIN food_sub_categories fsc ON fsc.id = mi.sub_category 
  AND fsc.organization_id = mi.organization_id;

-- Enable RLS
ALTER TABLE food_category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "View food relationships"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food relationships"
  ON food_category_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = food_category_groups.organization_id::text
      )
    )
  );

-- Repeat for other tables
CREATE POLICY "View food categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food categories"
  ON food_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = food_categories.organization_id::text
      )
    )
  );

CREATE POLICY "View food sub-categories"
  ON food_sub_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage food sub-categories"
  ON food_sub_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = food_sub_categories.organization_id::text
      )
    )
  );

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

CREATE POLICY "View inventory counts"
  ON inventory_counts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage inventory counts"
  ON inventory_counts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = inventory_counts.organization_id::text
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_food_category_groups_org ON food_category_groups(organization_id);
CREATE INDEX idx_food_categories_org_group ON food_categories(organization_id, group_id);
CREATE INDEX idx_food_sub_categories_org_cat ON food_sub_categories(organization_id, category_id);
CREATE INDEX idx_master_ingredients_org_id ON master_ingredients(organization_id);
CREATE INDEX idx_master_ingredients_item_code ON master_ingredients(item_code);
CREATE INDEX idx_master_ingredients_major_group ON master_ingredients(major_group);
CREATE INDEX idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX idx_master_ingredients_sub_category ON master_ingredients(sub_category);
CREATE INDEX idx_inventory_counts_org_id ON inventory_counts(organization_id);
CREATE INDEX idx_inventory_counts_ingredient_id ON inventory_counts(master_ingredient_id);
CREATE INDEX idx_inventory_counts_date ON inventory_counts(count_date);
CREATE INDEX idx_inventory_counts_status ON inventory_counts(status);

-- Create triggers for updated_at
CREATE TRIGGER update_food_category_groups_updated_at
  BEFORE UPDATE ON food_category_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_categories_updated_at
  BEFORE UPDATE ON food_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_sub_categories_updated_at
  BEFORE UPDATE ON food_sub_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_ingredients_updated_at
  BEFORE UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_counts_updated_at
  BEFORE UPDATE ON inventory_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;
GRANT SELECT ON inventory_counts_with_ingredients TO authenticated;
GRANT ALL ON master_ingredients TO authenticated;
GRANT ALL ON inventory_counts TO authenticated;

-- Add helpful comments
COMMENT ON TABLE food_category_groups IS 'Stores top-level food category groups with organization scope';
COMMENT ON TABLE food_categories IS 'Stores food categories within groups with organization scope';
COMMENT ON TABLE food_sub_categories IS 'Stores sub-categories within categories with organization scope';
COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data including allergen information';
COMMENT ON TABLE inventory_counts IS 'Stores inventory count history linked to master ingredients';
COMMENT ON VIEW master_ingredients_with_categories IS 'View that includes resolved category names for master ingredients';
COMMENT ON VIEW inventory_counts_with_ingredients IS 'View that includes ingredient details for inventory counts';

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'system_role', 'dev',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';