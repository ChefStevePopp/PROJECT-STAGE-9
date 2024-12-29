-- Drop and recreate recipe_unit_type column with proper type
ALTER TABLE master_ingredients 
DROP COLUMN IF EXISTS recipe_unit_type;

ALTER TABLE master_ingredients
ADD COLUMN recipe_unit_type TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_recipe_unit_type 
ON master_ingredients(recipe_unit_type);

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.recipe_unit_type IS 'Type of unit used for recipe measurements';

-- Update existing rows to use default recipe unit type if needed
UPDATE master_ingredients 
SET recipe_unit_type = 'portion'
WHERE recipe_unit_type IS NULL;