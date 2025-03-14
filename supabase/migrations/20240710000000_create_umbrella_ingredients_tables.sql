-- Create umbrella_ingredients table
CREATE TABLE IF NOT EXISTS umbrella_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  major_group UUID REFERENCES food_category_groups(id),
  category UUID REFERENCES food_categories(id),
  sub_category UUID REFERENCES food_sub_categories(id),
  primary_master_ingredient_id UUID REFERENCES master_ingredients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create umbrella_ingredient_master_ingredients junction table
CREATE TABLE IF NOT EXISTS umbrella_ingredient_master_ingredients (
  umbrella_ingredient_id UUID NOT NULL REFERENCES umbrella_ingredients(id) ON DELETE CASCADE,
  master_ingredient_id UUID NOT NULL REFERENCES master_ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (umbrella_ingredient_id, master_ingredient_id)
);

-- Add RLS policies for umbrella_ingredients
ALTER TABLE umbrella_ingredients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their organization's umbrella ingredients" ON umbrella_ingredients;
DROP POLICY IF EXISTS "Users can insert umbrella ingredients for their organization" ON umbrella_ingredients;
DROP POLICY IF EXISTS "Users can update umbrella ingredients for their organization" ON umbrella_ingredients;
DROP POLICY IF EXISTS "Users can delete umbrella ingredients for their organization" ON umbrella_ingredients;

-- Create policies
CREATE POLICY "Users can view their organization's umbrella ingredients"
  ON umbrella_ingredients FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert umbrella ingredients for their organization"
  ON umbrella_ingredients FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update umbrella ingredients for their organization"
  ON umbrella_ingredients FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete umbrella ingredients for their organization"
  ON umbrella_ingredients FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
  ));

-- Add RLS policies for umbrella_ingredient_master_ingredients
ALTER TABLE umbrella_ingredient_master_ingredients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view umbrella ingredient associations for their organization" ON umbrella_ingredient_master_ingredients;
DROP POLICY IF EXISTS "Users can insert umbrella ingredient associations for their organization" ON umbrella_ingredient_master_ingredients;
DROP POLICY IF EXISTS "Users can delete umbrella ingredient associations for their organization" ON umbrella_ingredient_master_ingredients;

-- Create policies
CREATE POLICY "Users can view umbrella ingredient associations for their organization"
  ON umbrella_ingredient_master_ingredients FOR SELECT
  USING (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert umbrella ingredient associations for their organization"
  ON umbrella_ingredient_master_ingredients FOR INSERT
  WITH CHECK (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete umbrella ingredient associations for their organization"
  ON umbrella_ingredient_master_ingredients FOR DELETE
  USING (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
    )
  ));

-- Create a view to get umbrella ingredients with their associated master ingredients
CREATE OR REPLACE VIEW umbrella_ingredients_with_details AS
SELECT 
  ui.*,
  COALESCE(json_agg(uimi.master_ingredient_id) FILTER (WHERE uimi.master_ingredient_id IS NOT NULL), '[]'::json) AS master_ingredients
FROM 
  umbrella_ingredients ui
LEFT JOIN 
  umbrella_ingredient_master_ingredients uimi ON ui.id = uimi.umbrella_ingredient_id
GROUP BY 
  ui.id;

-- Add realtime publication for umbrella ingredients
alter publication supabase_realtime add table umbrella_ingredients;
alter publication supabase_realtime add table umbrella_ingredient_master_ingredients;