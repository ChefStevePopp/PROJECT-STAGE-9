-- Drop existing view
DROP VIEW IF EXISTS master_ingredients_with_categories;

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

-- Drop and recreate master ingredients policies
DROP POLICY IF EXISTS "View master ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "Manage master ingredients" ON master_ingredients;

CREATE POLICY "View master ingredients"
  ON master_ingredients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
      )
    )
  );

CREATE POLICY "Manage master ingredients"
  ON master_ingredients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = master_ingredients.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
      )
    )
  );

-- Grant appropriate permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;
GRANT ALL ON master_ingredients TO authenticated;

-- Add helpful comments
COMMENT ON VIEW master_ingredients_with_categories IS 
'View that includes resolved category names for master ingredients with proper organization scoping';

-- Ensure proper indexes exist
CREATE INDEX IF NOT EXISTS idx_master_ingredients_org_id 
ON master_ingredients(organization_id);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_major_group 
ON master_ingredients(major_group);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_category 
ON master_ingredients(category);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_sub_category 
ON master_ingredients(sub_category);

-- Update Steve's metadata to ensure dev access
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object(
  'firstName', 'Steve',
  'lastName', 'Dev Popp',
  'system_role', 'dev',
  'role', 'dev',
  'organizationId', 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
)
WHERE email = 'office@memphisfirebbq.com';