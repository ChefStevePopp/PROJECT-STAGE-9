-- First remove any duplicate or invalid item codes
WITH duplicates AS (
  SELECT organization_id, item_code, COUNT(*) 
  FROM master_ingredients 
  GROUP BY organization_id, item_code 
  HAVING COUNT(*) > 1
)
UPDATE master_ingredients mi
SET item_code = mi.item_code || '-' || mi.id
FROM duplicates d
WHERE mi.organization_id = d.organization_id 
AND mi.item_code = d.item_code;

-- Update any null or empty item codes
UPDATE master_ingredients
SET item_code = 'TEMP-' || id::text
WHERE item_code IS NULL OR item_code = '' OR item_code = '0';

-- Now add the constraint
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_unique_id_key,
DROP CONSTRAINT IF EXISTS master_ingredients_item_code_org_key;

ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_item_code_org_key 
UNIQUE (organization_id, item_code);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_org_id 
ON master_ingredients(organization_id);

CREATE INDEX IF NOT EXISTS idx_master_ingredients_item_code 
ON master_ingredients(item_code);

-- Add helpful comments
COMMENT ON COLUMN master_ingredients.item_code IS 'Vendor code or bar code for the ingredient';
COMMENT ON CONSTRAINT master_ingredients_item_code_org_key 
ON master_ingredients 
IS 'Ensures unique item codes within each organization';