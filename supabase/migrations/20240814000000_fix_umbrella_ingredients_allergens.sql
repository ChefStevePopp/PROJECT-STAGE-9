-- Drop the existing view if it exists
DROP VIEW IF EXISTS umbrella_ingredients_with_details;

-- Drop the existing table if it exists
DROP TABLE IF EXISTS umbrella_ingredients;

-- Create the umbrella_ingredients table with all the necessary columns
CREATE TABLE IF NOT EXISTS umbrella_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  major_group TEXT,
  category TEXT,
  sub_category TEXT,
  primary_master_ingredient_id UUID REFERENCES master_ingredients(id) ON DELETE SET NULL,
  master_ingredients UUID[] DEFAULT '{}',
  recipe_unit_type TEXT,
  cost_per_recipe_unit NUMERIC(10, 2),
  storage_area TEXT,
  -- Allergen columns
  allergen_peanut BOOLEAN DEFAULT FALSE,
  allergen_crustacean BOOLEAN DEFAULT FALSE,
  allergen_treenut BOOLEAN DEFAULT FALSE,
  allergen_shellfish BOOLEAN DEFAULT FALSE,
  allergen_sesame BOOLEAN DEFAULT FALSE,
  allergen_soy BOOLEAN DEFAULT FALSE,
  allergen_fish BOOLEAN DEFAULT FALSE,
  allergen_wheat BOOLEAN DEFAULT FALSE,
  allergen_milk BOOLEAN DEFAULT FALSE,
  allergen_sulphite BOOLEAN DEFAULT FALSE,
  allergen_egg BOOLEAN DEFAULT FALSE,
  allergen_gluten BOOLEAN DEFAULT FALSE,
  allergen_mustard BOOLEAN DEFAULT FALSE,
  allergen_celery BOOLEAN DEFAULT FALSE,
  allergen_garlic BOOLEAN DEFAULT FALSE,
  allergen_onion BOOLEAN DEFAULT FALSE,
  allergen_nitrite BOOLEAN DEFAULT FALSE,
  allergen_mushroom BOOLEAN DEFAULT FALSE,
  allergen_hot_pepper BOOLEAN DEFAULT FALSE,
  allergen_citrus BOOLEAN DEFAULT FALSE,
  allergen_pork BOOLEAN DEFAULT FALSE,
  allergen_custom1_name TEXT,
  allergen_custom1_active BOOLEAN DEFAULT FALSE,
  allergen_custom2_name TEXT,
  allergen_custom2_active BOOLEAN DEFAULT FALSE,
  allergen_custom3_name TEXT,
  allergen_custom3_active BOOLEAN DEFAULT FALSE,
  allergen_notes TEXT
);

-- Create a unique constraint on organization_id and name
ALTER TABLE umbrella_ingredients ADD CONSTRAINT umbrella_ingredients_org_name_unique UNIQUE (organization_id, name);

-- Create a view that joins umbrella_ingredients with master_ingredients
CREATE OR REPLACE VIEW umbrella_ingredients_with_details AS
SELECT 
  ui.*,
  fr_major.name AS major_group_name,
  fr_category.name AS category_name,
  fr_subcategory.name AS sub_category_name,
  ARRAY(
    SELECT mi.id 
    FROM master_ingredients mi 
    WHERE mi.id = ANY(ui.master_ingredients)
  ) AS master_ingredient_details
FROM 
  umbrella_ingredients ui
LEFT JOIN 
  food_relationships fr_major ON ui.major_group = fr_major.id
LEFT JOIN 
  food_relationships fr_category ON ui.category = fr_category.id
LEFT JOIN 
  food_relationships fr_subcategory ON ui.sub_category = fr_subcategory.id;

-- Add RLS policies
ALTER TABLE umbrella_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for umbrella_ingredients
CREATE POLICY "Users can view their organization's umbrella ingredients"
  ON umbrella_ingredients
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their organization's umbrella ingredients"
  ON umbrella_ingredients
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their organization's umbrella ingredients"
  ON umbrella_ingredients
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their organization's umbrella ingredients"
  ON umbrella_ingredients
  FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_umbrella_ingredients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_umbrella_ingredients_updated_at
BEFORE UPDATE ON umbrella_ingredients
FOR EACH ROW
EXECUTE FUNCTION update_umbrella_ingredients_updated_at();

-- Enable realtime
alter publication supabase_realtime add table umbrella_ingredients;
