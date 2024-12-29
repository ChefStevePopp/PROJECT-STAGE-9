-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prepared', 'final')),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  station TEXT,
  storage_area TEXT,
  container TEXT,
  container_type TEXT,
  shelf_life TEXT,
  description TEXT,
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  recipe_unit_ratio TEXT,
  unit_type TEXT,
  cost_per_ratio_unit DECIMAL(10,2) DEFAULT 0,
  cost_per_serving DECIMAL(10,2) DEFAULT 0,
  instructions TEXT[] DEFAULT '{}',
  notes TEXT,
  image_url TEXT,
  video_url TEXT,
  allergens TEXT[] DEFAULT '{}',
  CONSTRAINT recipes_name_org_unique UNIQUE (organization_id, name)
);

-- Create recipe_ingredients junction table
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('raw', 'prepared')),
  name TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  prepared_item_id UUID REFERENCES recipes(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view recipes in their organization"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = recipes.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = recipes.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view recipe ingredients"
  ON recipe_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN organization_members om ON om.organization_id = r.organization_id
      WHERE r.id = recipe_ingredients.recipe_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage recipe ingredients"
  ON recipe_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN organization_members om ON om.organization_id = r.organization_id
      WHERE r.id = recipe_ingredients.recipe_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );