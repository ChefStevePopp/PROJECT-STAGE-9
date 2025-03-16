-- Add missing columns to umbrella_ingredients table
ALTER TABLE umbrella_ingredients
ADD COLUMN IF NOT EXISTS storage_area TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS recipe_unit_type TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS cost_per_recipe_unit NUMERIC DEFAULT 0;

-- Drop and recreate the view to include these columns
DROP VIEW IF EXISTS umbrella_ingredients_with_details;

CREATE VIEW umbrella_ingredients_with_details AS
SELECT 
  ui.*,
  mg.name AS major_group_name,
  c.name AS category_name,
  sc.name AS sub_category_name,
  uimi.master_ingredient_ids AS master_ingredients
FROM umbrella_ingredients ui
LEFT JOIN food_category_groups mg ON ui.major_group = mg.id
LEFT JOIN food_categories c ON ui.category = c.id
LEFT JOIN food_sub_categories sc ON ui.sub_category = sc.id
LEFT JOIN (
  SELECT 
    umbrella_ingredient_id,
    ARRAY_AGG(master_ingredient_id) AS master_ingredient_ids
  FROM umbrella_ingredient_master_ingredients
  GROUP BY umbrella_ingredient_id
) uimi ON ui.id = uimi.umbrella_ingredient_id;
