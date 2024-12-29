-- Drop existing view and policies
DROP VIEW IF EXISTS master_ingredients_with_categories;
DROP POLICY IF EXISTS "View master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Manage master ingredients" ON master_ingredients;

-- Create master_ingredients_with_categories view
CREATE OR REPLACE VIEW master_ingredients_with_categories AS
SELECT 
  mi.*,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name
FROM master_ingredients mi
LEFT JOIN food_category_groups fcg ON fcg.id = mi.major_group 
  AND fcg.organization_id = mi.organization_id
LEFT JOIN food_categories fc ON fc.id = mi.category 
  AND fc.organization_id = mi.organization_id
LEFT JOIN food_sub_categories fsc ON fsc.id = mi.sub_category 
  AND fsc.organization_id = mi.organization_id;

-- Create