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
  storage_area TEXT,
  container TEXT,
  container_type TEXT,
  shelf_life TEXT,
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  rest_time INTEGER DEFAULT 0,
  total_time INTEGER GENERATED ALWAYS AS (prep_time + cook_time + rest_time) STORED,
  recipe_unit_ratio TEXT,
  unit_type TEXT,
  yield_amount INTEGER,
  yield_unit TEXT,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  labor_cost_per_hour DECIMAL(10,2) DEFAULT 30,
  total_cost DECIMAL(10,2) DEFAULT 0,
  target_cost_percent INTEGER DEFAULT 25,
  image_url TEXT,
  video_url TEXT,
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES auth.users(id),
  modified_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, name)
);

-- Create recipe_ingredients junction table
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('raw', 'prepared')),
  master_ingredient_id UUID REFERENCES master_ingredients(id) ON DELETE SET NULL,
  prepared_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  CONSTRAINT recipe_ingredients_ingredient_type_check 
    CHECK (
      (type = 'raw' AND master_ingredient_id IS NOT NULL AND prepared_recipe_id IS NULL) OR
      (type = 'prepared' AND prepared_recipe_id IS NOT NULL AND master_ingredient_id IS NULL)
    )
);

-- Create recipe_steps table
CREATE TABLE recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  instruction TEXT NOT NULL,
  notes TEXT,
  warning_level TEXT CHECK (warning_level IN ('info', 'warning', 'critical')),
  time_in_minutes INTEGER DEFAULT 0,
  temperature_value DECIMAL(5,1),
  temperature_unit TEXT CHECK (temperature_unit IN ('F', 'C')),
  is_quality_control_point BOOLEAN DEFAULT false,
  is_critical_control_point BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Create recipe_equipment junction table
CREATE TABLE recipe_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  station TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  specifications TEXT,
  alternatives TEXT[],
  sort_order INTEGER DEFAULT 0
);

-- Create recipe_media table
CREATE TABLE recipe_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  step_id UUID REFERENCES recipe_steps(id) ON DELETE SET NULL,
  is_primary BOOLEAN DEFAULT false,
  tags TEXT[],
  sort_order INTEGER DEFAULT 0
);

-- Create recipe_versions table
CREATE TABLE recipe_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changes TEXT[],
  reverted_from UUID REFERENCES recipe_versions(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  data JSONB NOT NULL
);

-- Create recipe_quality_standards table
CREATE TABLE recipe_quality_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  appearance_description TEXT,
  appearance_image_urls TEXT[],
  texture_points TEXT[],
  taste_points TEXT[],
  aroma_points TEXT[],
  plating_instructions TEXT,
  plating_image_url TEXT,
  temperature_value DECIMAL(5,1),
  temperature_unit TEXT CHECK (temperature_unit IN ('F', 'C')),
  temperature_tolerance DECIMAL(3,1)
);

-- Create recipe_training table
CREATE TABLE recipe_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  required_skill_level TEXT CHECK (required_skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  certification_required TEXT[],
  common_errors TEXT[],
  key_techniques TEXT[],
  safety_protocols TEXT[],
  quality_standards TEXT[],
  notes TEXT
);

-- Enable RLS
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_quality_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_training ENABLE ROW LEVEL SECURITY;

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

-- Repeat similar policies for related tables
CREATE POLICY "View recipe details"
  ON recipe_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recipes r
      JOIN organization_roles o ON o.organization_id = r.organization_id
      WHERE r.id = recipe_ingredients.recipe_id
      AND o.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'dev'
    )
  );

-- Create indexes for performance
CREATE INDEX idx_recipes_org_id ON recipes(organization_id);
CREATE INDEX idx_recipes_type ON recipes(type);
CREATE INDEX idx_recipes_major_group ON recipes(major_group);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_sub_category ON recipes(sub_category);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id);
CREATE INDEX idx_recipe_equipment_recipe ON recipe_equipment(recipe_id);
CREATE INDEX idx_recipe_media_recipe ON recipe_media(recipe_id);
CREATE INDEX idx_recipe_versions_recipe ON recipe_versions(recipe_id);

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_ingredients_updated_at
  BEFORE UPDATE ON recipe_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE recipes IS 'Stores recipe data including basic info, timing, and costs';
COMMENT ON TABLE recipe_ingredients IS 'Junction table linking recipes to ingredients with quantities';
COMMENT ON TABLE recipe_steps IS 'Stores recipe instructions with quality control points';
COMMENT ON TABLE recipe_equipment IS 'Tracks equipment needed for each recipe';
COMMENT ON TABLE recipe_media IS 'Stores recipe photos, videos and other media';
COMMENT ON TABLE recipe_versions IS 'Tracks recipe versions and changes over time';
COMMENT ON TABLE recipe_quality_standards IS 'Defines quality criteria for recipe execution';
COMMENT ON TABLE recipe_training IS 'Stores training requirements and documentation';