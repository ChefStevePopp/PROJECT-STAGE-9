-- Add inventory_unit_cost column to master_ingredients table
ALTER TABLE master_ingredients ADD COLUMN IF NOT EXISTS inventory_unit_cost DECIMAL;

-- Create a function to safely extract numeric values from text
CREATE OR REPLACE FUNCTION extract_numeric(text_val TEXT)
RETURNS NUMERIC AS $$
DECLARE
  numeric_part NUMERIC;
BEGIN
  -- Extract the first numeric part from the string
  numeric_part := substring(text_val from '^([0-9]+\.?[0-9]*)\s*')::numeric;
  RETURN COALESCE(numeric_part, 1.00); -- Failsafe: return 1.00 if extraction fails
EXCEPTION WHEN OTHERS THEN
  RETURN 1.00; -- Failsafe: return 1.00 on any error
END;
$$ LANGUAGE plpgsql;

-- Update existing records to calculate the initial value
UPDATE master_ingredients 
SET inventory_unit_cost = 
  CASE 
    WHEN current_price IS NOT NULL AND 
         units_per_case IS NOT NULL
    THEN current_price / extract_numeric(units_per_case) 
    ELSE 1.00 -- Failsafe default value
  END;

-- Create a trigger function to automatically calculate inventory_unit_cost
CREATE OR REPLACE FUNCTION calculate_inventory_unit_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.inventory_unit_cost := 
    CASE 
      WHEN NEW.current_price IS NOT NULL AND 
           NEW.units_per_case IS NOT NULL
      THEN NEW.current_price / extract_numeric(NEW.units_per_case) 
      ELSE 1.00 -- Failsafe default value
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to the master_ingredients table
DROP TRIGGER IF EXISTS calculate_inventory_unit_cost_trigger ON master_ingredients;
CREATE TRIGGER calculate_inventory_unit_cost_trigger
BEFORE INSERT OR UPDATE OF current_price, units_per_case
ON master_ingredients
FOR EACH ROW
EXECUTE FUNCTION calculate_inventory_unit_cost();

-- Enable realtime for the table (only if publication is not FOR ALL TABLES)
DO $$
BEGIN
  -- Check if the publication exists and is not FOR ALL TABLES
  IF EXISTS (
    SELECT 1 FROM pg_publication 
    WHERE pubname = 'supabase_realtime' 
    AND puballtables = false
  ) THEN
    -- Only add the table if the publication is not FOR ALL TABLES
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE master_ingredients';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Silently continue if there's an error
  NULL;
END;
$$;