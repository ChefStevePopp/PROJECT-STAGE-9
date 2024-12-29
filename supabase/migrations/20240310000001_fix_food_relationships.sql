-- Drop existing columns if they exist
ALTER TABLE master_ingredients
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS sub_category;

-- Add new relationship columns
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS major_group UUID REFERENCES food_category_groups(id),
ADD COLUMN IF NOT EXISTS category UUID REFERENCES food_categories(id),
ADD COLUMN IF NOT EXISTS sub_category UUID REFERENCES food_sub_categories(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_major_group ON master_ingredients(major_group);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_category ON master_ingredients(category);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_sub_category ON master_ingredients(sub_category);

-- Add helpful comments
COMMENT ON COLUMN master_ingredients.major_group IS 'Reference to top-level food category group';
COMMENT ON COLUMN master_ingredients.category IS 'Reference to food category';
COMMENT ON COLUMN master_ingredients.sub_category IS 'Reference to food sub-category';