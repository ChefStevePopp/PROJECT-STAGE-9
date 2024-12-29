-- Drop existing relationship columns if they exist
ALTER TABLE master_ingredients
DROP COLUMN IF EXISTS major_group CASCADE,
DROP COLUMN IF EXISTS category CASCADE,
DROP COLUMN IF EXISTS sub_category CASCADE;

-- Add new relationship columns with proper foreign keys
ALTER TABLE master_ingredients
ADD COLUMN major_group UUID REFERENCES food_category_groups(id),
ADD COLUMN category UUID REFERENCES food_categories(id),
ADD COLUMN sub_category UUID REFERENCES food_sub_categories(id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_major_group 
ON master_ingredients(major_group);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_category 
ON master_ingredients(category);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_sub_category 
ON master_ingredients(sub_category);

-- Add foreign key constraints
ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_major_group_fk
FOREIGN KEY (major_group, organization_id)
REFERENCES food_category_groups(id, organization_id)
ON DELETE SET NULL,

ADD CONSTRAINT master_ingredients_category_fk
FOREIGN KEY (category, organization_id)
REFERENCES food_categories(id, organization_id)
ON DELETE SET NULL,

ADD CONSTRAINT master_ingredients_sub_category_fk
FOREIGN KEY (sub_category, organization_id)
REFERENCES food_sub_categories(id, organization_id)
ON DELETE SET NULL;

-- Add helpful comments
COMMENT ON COLUMN master_ingredients.major_group IS 'Reference to top-level food category group';
COMMENT ON COLUMN master_ingredients.category IS 'Reference to food category';
COMMENT ON COLUMN master_ingredients.sub_category IS 'Reference to food sub-category';

-- Create function to validate category relationships
CREATE OR REPLACE FUNCTION validate_ingredient_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure category belongs to major group
  IF NEW.category IS NOT NULL AND NEW.major_group IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM food_categories
      WHERE id = NEW.category
      AND group_id = NEW.major_group
    ) THEN
      RAISE EXCEPTION 'Category must belong to the selected major group';
    END IF;
  END IF;

  -- Ensure sub-category belongs to category
  IF NEW.sub_category IS NOT NULL AND NEW.category IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM food_sub_categories
      WHERE id = NEW.sub_category
      AND category_id = NEW.category
    ) THEN
      RAISE EXCEPTION 'Sub-category must belong to the selected category';
    END IF;
  END IF;

  -- Clear lower-level selections when parent is cleared
  IF NEW.major_group IS NULL THEN
    NEW.category := NULL;
    NEW.sub_category := NULL;
  END IF;

  IF NEW.category IS NULL THEN
    NEW.sub_category := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for category validation
DROP TRIGGER IF EXISTS validate_ingredient_categories_trigger ON master_ingredients;
CREATE TRIGGER validate_ingredient_categories_trigger
  BEFORE INSERT OR UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION validate_ingredient_categories();

-- Add comment explaining the validation
COMMENT ON FUNCTION validate_ingredient_categories() IS 
'Ensures proper hierarchical relationships between food categories';