-- Drop existing view
DROP VIEW IF EXISTS master_ingredients_with_categories;

-- Ensure master_ingredients table has correct structure
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_unique_id_key,
DROP CONSTRAINT IF EXISTS master_ingredients_item_code_org_key,
DROP CONSTRAINT IF EXISTS master_ingredients_major_group_fk,
DROP CONSTRAINT IF EXISTS master_ingredients_category_fk,
DROP CONSTRAINT IF EXISTS master_ingredients_sub_category_fk;

-- Clean up any invalid data
UPDATE master_ingredients
SET item_code = CASE
  WHEN item_code IS NULL OR item_code = '' OR item_code = '0' 
  THEN 'TEMP-' || id::text
  ELSE item_code
END;

-- Add proper constraints
ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_item_code_org_key 
UNIQUE (organization_id, item_code);

-- Add foreign key constraints with proper organization scoping
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

-- Recreate the view with proper joins
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

-- Add RLS policies
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
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
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
    OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'system_role' = 'dev'
    )
  );

-- Grant permissions
GRANT SELECT ON master_ingredients_with_categories TO authenticated;
GRANT ALL ON master_ingredients TO authenticated;

-- Add helpful comments
COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data including allergen information';
COMMENT ON COLUMN master_ingredients.item_code IS 'Vendor code or bar code for the ingredient';
COMMENT ON VIEW master_ingredients_with_categories IS 'View that includes resolved category names for master ingredients';