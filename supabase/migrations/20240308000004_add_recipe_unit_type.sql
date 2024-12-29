-- Add recipe_unit_type column to master_ingredients
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS recipe_unit_type TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.recipe_unit_type IS 'Type of unit used for recipe measurements';