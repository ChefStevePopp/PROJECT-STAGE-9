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

-- Create policies
CREATE POLICY "View food relationships"
  ON food_category_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_category_groups.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage food relationships"
  ON food_category_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_category_groups.organization_id
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

-- Repeat policies for categories
CREATE POLICY "View food categories"
  ON food_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_categories.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage food categories"
  ON food_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_categories.organization_id
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

-- Repeat policies for sub-categories
CREATE POLICY "View food sub-categories"
  ON food_sub_categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_sub_categories.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage food sub-categories"
  ON food_sub_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = food_sub_categories.organization_id
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
CREATE INDEX idx_food_category_groups_org ON food_category_groups(organization_id);
CREATE INDEX idx_food_categories_org ON food_categories(organization_id);
CREATE INDEX idx_food_categories_group ON food_categories(group_id);
CREATE INDEX idx_food_sub_categories_org ON food_sub_categories(organization_id);
CREATE INDEX idx_food_sub_categories_category ON food_sub_categories(category_id);

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

-- Add helpful comments
COMMENT ON TABLE food_category_groups IS 'Stores top-level category groups for organizing food items';
COMMENT ON TABLE food_categories IS 'Stores food categories within each group';
COMMENT ON TABLE food_sub_categories IS 'Stores sub-categories within each food category';

-- Insert initial data for Memphis Fire BBQ
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
  meat_group_id uuid;
  produce_group_id uuid;
  meat_category_id uuid;
  poultry_category_id uuid;
  vegetables_category_id uuid;
BEGIN
  -- Create category groups
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES 
  (org_id, 'Proteins', 'Meat, poultry, and seafood items', 'Beef', 'rose', 1)
  RETURNING id INTO meat_group_id;

  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES 
  (org_id, 'Produce', 'Fresh fruits and vegetables', 'Carrot', 'green', 2)
  RETURNING id INTO produce_group_id;

  -- Create categories
  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, meat_group_id, 'Beef', 'All beef products', 1)
  RETURNING id INTO meat_category_id;

  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, meat_group_id, 'Poultry', 'Chicken and turkey products', 2)
  RETURNING id INTO poultry_category_id;

  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, produce_group_id, 'Vegetables', 'Fresh vegetables', 1)
  RETURNING id INTO vegetables_category_id;

  -- Create sub-categories
  INSERT INTO food_sub_categories (
    organization_id,
    category_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, meat_category_id, 'Brisket', 'Beef brisket cuts', 1),
  (org_id, meat_category_id, 'Ribs', 'Beef rib cuts', 2),
  (org_id, poultry_category_id, 'Chicken', 'Fresh chicken', 1),
  (org_id, poultry_category_id, 'Turkey', 'Fresh turkey', 2),
  (org_id, vegetables_category_id, 'Root Vegetables', 'Root-based vegetables', 1),
  (org_id, vegetables_category_id, 'Leafy Greens', 'Leafy green vegetables', 2);

END $$;