-- Add allergens array column to master_ingredients table
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS allergens TEXT[] DEFAULT '{}';

-- Add index for allergens array
CREATE INDEX IF NOT EXISTS idx_master_ingredients_allergens 
ON master_ingredients USING GIN (allergens);

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.allergens IS 'Array of allergen identifiers for the ingredient';

-- Update existing rows to have empty array if null
UPDATE master_ingredients 
SET allergens = '{}'
WHERE allergens IS NULL;