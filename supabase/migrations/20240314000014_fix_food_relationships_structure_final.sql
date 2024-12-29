-- Drop and recreate tables with proper constraints
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

-- Enable RLS
ALTER TABLE food_category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_sub_categories ENABLE ROW LEVEL SECURITY;

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

-- Repeat for categories
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

-- Repeat for sub-categories
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

-- Create indexes for performance
CREATE INDEX idx_food_category_groups_org ON food_category_groups(organization_id);
CREATE INDEX idx_food_categories_org_group ON food_categories(organization_id, group_id);
CREATE INDEX idx_food_sub_categories_org_cat ON food_sub_categories(organization_id, category_id);

-- Add triggers for updated_at
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

-- Re-seed initial data for Memphis Fire BBQ
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
  food_group_id uuid;
  beverage_group_id uuid;
  alcohol_group_id uuid;
  supplies_group_id uuid;
  proteins_cat_id uuid;
  produce_cat_id uuid;
  dairy_cat_id uuid;
BEGIN
  -- Create Food group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Food',
    'All food items including raw ingredients and prepared items',
    'Package',
    'primary',
    1
  ) RETURNING id INTO food_group_id;

  -- Create Beverage group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Beverage',
    'Non-alcoholic beverages including soft drinks and juices',
    'Coffee',
    'amber',
    2
  ) RETURNING id INTO beverage_group_id;

  -- Create Alcohol group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Alcohol',
    'Alcoholic beverages including beer, wine, and spirits',
    'Wine',
    'rose',
    3
  ) RETURNING id INTO alcohol_group_id;

  -- Create Supplies group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Supplies',
    'Non-food items including packaging and cleaning supplies',
    'Box',
    'purple',
    4
  ) RETURNING id INTO supplies_group_id;

  -- Create food categories
  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  -- Food categories
  (org_id, food_group_id, 'Proteins', 'Meat, poultry, and seafood', 1)
  RETURNING id INTO proteins_cat_id;

  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, food_group_id, 'Produce', 'Fresh fruits and vegetables', 2)
  RETURNING id INTO produce_cat_id;

  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, food_group_id, 'Dairy', 'Milk products and eggs', 3)
  RETURNING id INTO dairy_cat_id;

  -- Create sub-categories
  INSERT INTO food_sub_categories (
    organization_id,
    category_id,
    name,
    description,
    sort_order
  ) VALUES
  -- Protein sub-categories
  (org_id, proteins_cat_id, 'Beef', 'All beef products', 1),
  (org_id, proteins_cat_id, 'Pork', 'All pork products', 2),
  (org_id, proteins_cat_id, 'Poultry', 'Chicken and turkey products', 3),
  -- Produce sub-categories
  (org_id, produce_cat_id, 'Fresh Vegetables', 'Fresh vegetables', 1),
  (org_id, produce_cat_id, 'Fresh Fruits', 'Fresh fruits', 2),
  (org_id, produce_cat_id, 'Herbs', 'Fresh herbs', 3),
  -- Dairy sub-categories
  (org_id, dairy_cat_id, 'Milk', 'Fresh milk products', 1),
  (org_id, dairy_cat_id, 'Cheese', 'Cheese products', 2),
  (org_id, dairy_cat_id, 'Eggs', 'Fresh eggs', 3);

END $$;