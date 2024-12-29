-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prepared', 'final')),
  name TEXT NOT NULL,
  description TEXT,
  major_group UUID REFERENCES food_category_groups(id) ON DELETE SET NULL,
  category UUID REFERENCES food_categories(id) ON DELETE SET NULL,
  sub_category UUID REFERENCES food_sub_categories(id) ON DELETE SET NULL,
  station TEXT,
  storage JSONB DEFAULT jsonb_build_object(
    'temperature', jsonb_build_object(
      'value', 40,
      'unit', 'F',
      'tolerance', 2
    ),
    'shelfLife', jsonb_build_object(
      'value', 1,
      'unit', 'days'
    ),
    'specialInstructions', '[]'::jsonb
  ),
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  recipe_unit_ratio TEXT,
  unit_type TEXT,
  yield_amount INTEGER,
  yield_unit TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  cost_per_serving DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  video_url TEXT,
  allergen_info JSONB DEFAULT jsonb_build_object(
    'contains', '[]'::jsonb,
    'mayContain', '[]'::jsonb,
    'crossContactRisk', '[]'::jsonb
  ),
  created_by UUID REFERENCES auth.users(id),
  modified_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, name)
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = recipes.organization_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

CREATE POLICY "Manage recipes"
  ON recipes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = recipes.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Create indexes
CREATE INDEX idx_recipes_org_id ON recipes(organization_id);
CREATE INDEX idx_recipes_type ON recipes(type);
CREATE INDEX idx_recipes_major_group ON recipes(major_group);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_sub_category ON recipes(sub_category);

-- Add helpful comments
COMMENT ON TABLE recipes IS 'Stores recipe data including storage protocols and allergen information';
COMMENT ON COLUMN recipes.storage IS 'JSON object containing temperature, shelf life and storage instructions';
COMMENT ON COLUMN recipes.allergen_info IS 'JSON object containing allergen information and warnings';