-- Create trigger function to ensure item_code is never empty or null
CREATE OR REPLACE FUNCTION ensure_valid_item_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.item_code IS NULL OR NEW.item_code = '' OR NEW.item_code = '0' THEN
    NEW.item_code := 'TEMP-' || NEW.id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS ensure_valid_item_code_trigger ON master_ingredients;
CREATE TRIGGER ensure_valid_item_code_trigger
  BEFORE INSERT OR UPDATE ON master_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION ensure_valid_item_code();

-- Add comment explaining the trigger
COMMENT ON FUNCTION ensure_valid_item_code() 
IS 'Ensures master ingredients always have a valid item code';