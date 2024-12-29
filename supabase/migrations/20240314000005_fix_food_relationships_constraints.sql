-- Drop existing foreign key constraints
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_major_group_fk,
DROP CONSTRAINT IF EXISTS master_ingredients_category_fk,
DROP CONSTRAINT IF EXISTS master_ingredients_sub_category_fk;

-- Drop existing tables and recreate with proper constraints
DROP TABLE IF EXISTS food_sub_categories CASCADE;
DROP TABLE IF EXISTS food_categories CASCADE;
DROP TABLE IF EXISTS food_category_groups CASCADE;

-- Create food_category_groups table with proper constraints
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

-- Create food_categories table with proper constraints
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

-- Create food_sub_categories table with proper constraints
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
CREATE INDEX idx_food_categories_org ON food_categories(organization_id);
CREATE INDEX idx_food_categories_group ON food_categories(group_id);
CREATE INDEX idx_food_sub_categories_org ON food_sub_categories(organization_id);
CREATE INDEX idx_food_sub_categories_category ON food_sub_categories(category_id);

-- Add helpful comments
COMMENT ON TABLE food_category_groups IS 'Stores top-level food category groups with organization scope';
COMMENT ON TABLE food_categories IS 'Stores food categories within groups with organization scope';
COMMENT ON TABLE food_sub_categories IS 'Stores sub-categories within categories with organization scope';

-- Re-add foreign key constraints to master_ingredients
ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_major_group_fk
FOREIGN KEY (major_group, organization_id)
REFERENCES food_category_groups(id, organization_id)
ON DELETE SET NULL,

ADD CONSTRAINT master_ingredients_category_fk
FOREIGN KEY (category, organization_id)
REFERENCES food_categories(id, organization_id)
ON DELETE SET NULL,

ADD CONSTRAINT master_ingredients_sub_category_fk
FOREIGN KEY (sub_category, organization_id)
REFERENCES food_sub_categories(id, organization_id)
ON DELETE SET NULL;