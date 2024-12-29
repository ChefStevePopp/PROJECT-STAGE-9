-- Update prepared_items table to fix recipe unit column names
ALTER TABLE prepared_items 
  RENAME COLUMN recipe_unit_ratio TO recipe_unit;

ALTER TABLE prepared_items 
  RENAME COLUMN cost_per_ratio_unit TO cost_per_recipe_unit;

-- Update master_ingredients table to fix recipe unit column names
ALTER TABLE master_ingredients
  RENAME COLUMN ratio_per_unit TO recipe_unit_per_purchase_unit;

ALTER TABLE master_ingredients
  RENAME COLUMN price_per_ratio_unit TO cost_per_recipe_unit;

-- Add comments to clarify naming
COMMENT ON COLUMN prepared_items.recipe_unit IS 'Recipe unit measurement (e.g., "1 portion", "4 servings")';
COMMENT ON COLUMN prepared_items.cost_per_recipe_unit IS 'Cost per recipe unit';
COMMENT ON COLUMN master_ingredients.recipe_unit_per_purchase_unit IS 'Number of recipe units per purchase unit';
COMMENT ON COLUMN master_ingredients.cost_per_recipe_unit IS 'Cost per recipe unit';