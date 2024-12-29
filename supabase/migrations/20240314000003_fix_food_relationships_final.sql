-- Drop and recreate tables with proper organization scoping
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
  UNIQUE(organization_id, name)
);

-- Create food_categories table
CREATE TABLE food_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES food_category_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(organization_id, group_id, name)
);

-- Create food_sub_categories table
CREATE TABLE food_sub_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES food_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(organization_id, category_id, name)
);

-- Enable RLS
ALTER TABLE food_category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_sub_categories ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "View food category groups"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (
    organization_id = (auth.jwt() ->> 'organizationId')::uuid
    OR auth.jwt() ->> 'system_role' = 'dev'
  );

CREATE POLICY "Manage food category groups"
  ON food_category_groups FOR ALL
  TO authenticated
  USING (
    (organization_id = (auth.jwt() ->> 'organizationId')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_category_groups.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    ))
    OR auth.jwt() ->> 'system_role' = 'dev'
  );

-- Repeat for categories
CREATE POLICY "View food categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (
    organization_id = (auth.jwt() ->> 'organizationId')::uuid
    OR auth.jwt() ->> 'system_role' = 'dev'
  );

CREATE POLICY "Manage food categories"
  ON food_categories FOR ALL
  TO authenticated
  USING (
    (organization_id = (auth.jwt() ->> 'organizationId')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_categories.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    ))
    OR auth.jwt() ->> 'system_role' = 'dev'
  );

-- Repeat for sub-categories
CREATE POLICY "View food sub-categories"
  ON food_sub_categories FOR SELECT
  TO authenticated
  USING (
    organization_id = (auth.jwt() ->> 'organizationId')::uuid
    OR auth.jwt() ->> 'system_role' = 'dev'
  );

CREATE POLICY "Manage food sub-categories"
  ON food_sub_categories FOR ALL
  TO authenticated
  USING (
    (organization_id = (auth.jwt() ->> 'organizationId')::uuid
    AND EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_sub_categories.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    ))
    OR auth.jwt() ->> 'system_role' = 'dev'
  );

-- Create indexes for performance
CREATE INDEX idx_food_category_groups_org ON food_category_groups(organization_id);
CREATE INDEX idx_food_categories_org_group ON food_categories(organization_id, group_id);
CREATE INDEX idx_food_sub_categories_org_cat ON food_sub_categories(organization_id, category_id);

-- Re-seed initial data for Memphis Fire BBQ
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
  food_group_id uuid;
  beverage_group_id uuid;
  alcohol_group_id uuid;
  supplies_group_id uuid;
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
  (org_id, food_group_id, 'Proteins', 'Meat, poultry, and seafood', 1),
  (org_id, food_group_id, 'Produce', 'Fresh fruits and vegetables', 2),
  (org_id, food_group_id, 'Dairy', 'Milk products and eggs', 3),
  (org_id, food_group_id, 'Dry Goods', 'Shelf-stable ingredients', 4),
  -- Beverage categories
  (org_id, beverage_group_id, 'Hot Beverages', 'Coffee, tea, and hot chocolate', 1),
  (org_id, beverage_group_id, 'Cold Beverages', 'Soft drinks and juices', 2),
  -- Alcohol categories
  (org_id, alcohol_group_id, 'Beer', 'All types of beer', 1),
  (org_id, alcohol_group_id, 'Wine', 'Red, white, and sparkling wines', 2),
  (org_id, alcohol_group_id, 'Spirits', 'Distilled beverages', 3),
  -- Supplies categories
  (org_id, supplies_group_id, 'Packaging', 'To-go containers and supplies', 1),
  (org_id, supplies_group_id, 'Cleaning', 'Cleaning supplies and chemicals', 2),
  (org_id, supplies_group_id, 'Equipment', 'Kitchen equipment and tools', 3);

END $$;