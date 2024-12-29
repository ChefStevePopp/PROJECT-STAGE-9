-- Update the master ingredients view to include category names
CREATE OR REPLACE VIEW master_ingredients_with_categories AS
SELECT 
  mi.*,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name
FROM master_ingredients mi
LEFT JOIN food_category_groups fcg ON fcg.id = mi.major_group
LEFT JOIN food_categories fc ON fc.id = mi.category
LEFT JOIN food_sub_categories fsc ON fsc.id = mi.sub_category;

-- Add comment explaining the view
COMMENT ON VIEW master_ingredients_with_categories IS 
'View that includes resolved category names for master ingredients';

-- Grant appropriate permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;