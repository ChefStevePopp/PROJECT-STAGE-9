-- Drop and recreate the view with proper joins
DROP VIEW IF EXISTS master_ingredients_with_categories;

CREATE VIEW master_ingredients_with_categories AS
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

-- Grant appropriate permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;

-- Add helpful comments
COMMENT ON VIEW master_ingredients_with_categories IS 
'View that includes resolved category names for master ingredients with proper organization scoping';