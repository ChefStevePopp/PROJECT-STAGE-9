-- First identify and fix any duplicate item codes
WITH duplicates AS (
  SELECT organization_id, item_code, array_agg(id) as ids
  FROM master_ingredients
  GROUP BY organization_id, item_code
  HAVING COUNT(*) > 1
)
UPDATE master_ingredients mi
SET item_code = mi.item_code || '-' || mi.id::text
FROM duplicates d
WHERE mi.organization_id = d.organization_id 
AND mi.item_code = d.item_code
AND mi.id = ANY(d.ids[2:]);

-- Clean up any remaining invalid item codes
UPDATE master_ingredients
SET item_code = 'TEMP-' || id::text
WHERE item_code IS NULL 
   OR item_code = '' 
   OR item_code = '0'
   OR item_code = 'null'
   OR item_code = 'undefined';

-- Drop and recreate the constraint
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_item_code_org_key;

ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_item_code_org_key 
UNIQUE (organization_id, item_code);

-- Create function to generate unique item code
CREATE OR REPLACE FUNCTION generate_unique_item_code(
  org_id uuid,
  base_code text
) RETURNS text AS $$
DECLARE
  new_code text;
  counter integer := 1;
BEGIN
  new_code := base_code;
  WHILE EXISTS (
    SELECT 1 
    FROM master_ingredients 
    WHERE organization_id = org_id 
    AND item_code = new_code
  ) LOOP
    new_code := base_code || '-' || counter;
    counter := counter + 1;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure unique item codes
CREATE OR REPLACE FUNCTION ensure_unique_item_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_code IS NULL OR NEW.item_code = '' OR NEW.item_code = '0' THEN
    NEW.item_code := 'TEMP-' || NEW.id::text;
  END IF;

  -- If item_code would create a duplicate, make it unique
  IF EXISTS (
    SELECT 1 
    FROM master_ingredients 
    WHERE organization_id = NEW.organization_id 
    AND item_code = NEW.item_code
    AND id != NEW.id
  ) THEN
    NEW.item_code := generate_unique_item_code(NEW.organization_id, NEW.item_code);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_unique_item_code_trigger ON master_ingredients;

-- Create new trigger
CREATE TRIGGER ensure_unique_item_code_trigger
  BEFORE INSERT OR UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION ensure_unique_item_code();

-- Add helpful comments
COMMENT ON FUNCTION generate_unique_item_code(uuid, text) IS 
'Generates a unique item code for the given organization by appending a counter if needed';

COMMENT ON FUNCTION ensure_unique_item_code() IS 
'Ensures item codes are unique within an organization and never null/empty';