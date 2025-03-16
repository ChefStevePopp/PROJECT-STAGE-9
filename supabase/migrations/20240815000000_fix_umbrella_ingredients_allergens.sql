-- Add allergen columns to umbrella_ingredients table
ALTER TABLE umbrella_ingredients
  ADD COLUMN IF NOT EXISTS storage_area TEXT,
  ADD COLUMN IF NOT EXISTS allergen_peanut BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_crustacean BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_treenut BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_shellfish BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_sesame BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_soy BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_fish BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_wheat BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_milk BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_sulphite BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_egg BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_gluten BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_mustard BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_celery BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_garlic BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_onion BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_nitrite BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_mushroom BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_hot_pepper BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_citrus BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_pork BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_custom1_name TEXT,
  ADD COLUMN IF NOT EXISTS allergen_custom1_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_custom2_name TEXT,
  ADD COLUMN IF NOT EXISTS allergen_custom2_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_custom3_name TEXT,
  ADD COLUMN IF NOT EXISTS allergen_custom3_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allergen_notes TEXT;

-- Drop the existing view if it exists
DROP VIEW IF EXISTS umbrella_ingredients_with_details;

-- Create a view that includes the allergen fields
CREATE OR REPLACE VIEW umbrella_ingredients_with_details AS
SELECT 
  ui.id,
  ui.created_at,
  ui.updated_at,
  ui.organization_id,
  ui.name,
  ui.description,
  ui.major_group,
  ui.category,
  ui.sub_category,
  ui.primary_master_ingredient_id,
  ui.storage_area,
  ui.allergen_peanut,
  ui.allergen_crustacean,
  ui.allergen_treenut,
  ui.allergen_shellfish,
  ui.allergen_sesame,
  ui.allergen_soy,
  ui.allergen_fish,
  ui.allergen_wheat,
  ui.allergen_milk,
  ui.allergen_sulphite,
  ui.allergen_egg,
  ui.allergen_gluten,
  ui.allergen_mustard,
  ui.allergen_celery,
  ui.allergen_garlic,
  ui.allergen_onion,
  ui.allergen_nitrite,
  ui.allergen_mushroom,
  ui.allergen_hot_pepper,
  ui.allergen_citrus,
  ui.allergen_pork,
  ui.allergen_custom1_name,
  ui.allergen_custom1_active,
  ui.allergen_custom2_name,
  ui.allergen_custom2_active,
  ui.allergen_custom3_name,
  ui.allergen_custom3_active,
  ui.allergen_notes,
  fcg.name AS major_group_name,
  fc.name AS category_name,
  fsc.name AS sub_category_name,
  mi.recipe_unit_type,
  mi.cost_per_recipe_unit,
  ARRAY_AGG(uimi.master_ingredient_id) FILTER (WHERE uimi.master_ingredient_id IS NOT NULL) as master_ingredients
FROM
  umbrella_ingredients ui
  LEFT JOIN food_category_groups fcg ON ui.major_group = fcg.id
  LEFT JOIN food_categories fc ON ui.category = fc.id
  LEFT JOIN food_sub_categories fsc ON ui.sub_category = fsc.id
  LEFT JOIN master_ingredients mi ON ui.primary_master_ingredient_id = mi.id
  LEFT JOIN umbrella_ingredient_master_ingredients uimi ON ui.id = uimi.umbrella_ingredient_id
GROUP BY
  ui.id,
  fcg.name,
  fc.name,
  fsc.name,
  mi.recipe_unit_type,
  mi.cost_per_recipe_unit;

-- Add trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_umbrella_ingredients_updated_at') THEN
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
  END IF;
END $$;
