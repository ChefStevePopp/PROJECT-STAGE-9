-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_master_ingredients_updated_at ON master_ingredients;

-- Create trigger
CREATE TRIGGER update_master_ingredients_updated_at
    BEFORE UPDATE ON master_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update view to ensure it includes the updated timestamp
CREATE OR REPLACE VIEW master_ingredients_with_categories AS
SELECT 
    mi.*,
    fr_major.name as major_group_name,
    fr_cat.name as category_name,
    fr_sub.name as sub_category_name
FROM 
    master_ingredients mi
    LEFT JOIN food_relationships fr_major ON mi.major_group = fr_major.id
    LEFT JOIN food_relationships fr_cat ON mi.category = fr_cat.id
    LEFT JOIN food_relationships fr_sub ON mi.sub_category = fr_sub.id;
