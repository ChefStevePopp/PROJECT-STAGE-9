-- Drop existing view if it exists
DROP VIEW IF EXISTS master_ingredients_with_categories;

-- Create view with proper category name resolution
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

-- Add comment explaining the view
COMMENT ON VIEW master_ingredients_with_categories IS 
'View that includes resolved category names for master ingredients with proper organization scoping';

-- Grant appropriate permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_major_group 
ON master_ingredients(major_group);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_category 
ON master_ingredients(category);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_sub_category 
ON master_ingredients(sub_category);

-- Add foreign key constraints with proper organization scoping
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_major_group_fk,
DROP CONSTRAINT IF EXISTS master_ingredients_category_fk,
DROP CONSTRAINT IF EXISTS master_ingredients_sub_category_fk;

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
COMMENT ON CONSTRAINT master_ingredients_major_group_fk ON master_ingredients IS 
'Links ingredients to major groups within the same organization';

COMMENT ON CONSTRAINT master_ingredients_category_fk ON master_ingredients IS 
'Links ingredients to categories within the same organization';

COMMENT ON CONSTRAINT master_ingredients_sub_category_fk ON master_ingredients IS 
'Links ingredients to sub-categories within the same organization';