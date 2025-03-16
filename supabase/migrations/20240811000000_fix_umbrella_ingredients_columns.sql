-- Add missing columns to umbrella_ingredients table
ALTER TABLE umbrella_ingredients
ADD COLUMN IF NOT EXISTS storage_area text,
ADD COLUMN IF NOT EXISTS storage_temperature text,
ADD COLUMN IF NOT EXISTS purchase_unit text,
ADD COLUMN IF NOT EXISTS purchase_unit_quantity numeric,
ADD COLUMN IF NOT EXISTS purchase_unit_cost numeric,
ADD COLUMN IF NOT EXISTS recipe_unit text,
ADD COLUMN IF NOT EXISTS recipe_unit_type text,
ADD COLUMN IF NOT EXISTS recipe_unit_quantity numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_cost numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_weight numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_volume numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_count numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_length numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_width numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_height numeric,
ADD COLUMN IF NOT EXISTS recipe_unit_diameter numeric;

-- Update the umbrella_ingredients_with_details view to include these columns
CREATE OR REPLACE VIEW umbrella_ingredients_with_details AS
SELECT 
  ui.*,
  ARRAY(
    SELECT uimi.master_ingredient_id 
    FROM umbrella_ingredient_master_ingredients uimi 
    WHERE uimi.umbrella_ingredient_id = ui.id
  ) as master_ingredients,
  mg.name as major_group_name,
  c.name as category_name,
  sc.name as sub_category_name
FROM umbrella_ingredients ui
LEFT JOIN food_major_groups mg ON ui.major_group = mg.id
LEFT JOIN food_categories c ON ui.category = c.id
LEFT JOIN food_sub_categories sc ON ui.sub_category = sc.id;
