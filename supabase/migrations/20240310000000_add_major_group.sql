-- Add major_group column to master_ingredients
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS major_group UUID REFERENCES food_category_groups(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_major_group 
ON master_ingredients(major_group);

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.major_group IS 'Reference to top-level food category group';