-- Add recipe_unit_type column to master_ingredients
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS recipe_unit_type TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.recipe_unit_type IS 'Type of unit used for recipe measurements (e.g., portion, serving, etc.)';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_recipe_unit_type 
ON master_ingredients(recipe_unit_type);

-- Add foreign key constraints for food relationships
ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_major_group_fk
FOREIGN KEY (major_group) REFERENCES food_category_groups(id),
ADD CONSTRAINT master_ingredients_category_fk
FOREIGN KEY (category) REFERENCES food_categories(id),
ADD CONSTRAINT master_ingredients_sub_category_fk
FOREIGN KEY (sub_category) REFERENCES food_sub_categories(id);