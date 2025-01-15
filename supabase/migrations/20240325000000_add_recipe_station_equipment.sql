-- Add station, equipment and production notes columns to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS primary_station text,
ADD COLUMN IF NOT EXISTS secondary_station text,
ADD COLUMN IF NOT EXISTS equipment jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS production_notes text;

-- Create a function to validate stations against operations_settings
CREATE OR REPLACE FUNCTION validate_recipe_stations()
 RETURNS trigger AS $$
DECLARE
  org_stations text[];
BEGIN
  -- Get the kitchen_stations array for this organization
  SELECT kitchen_stations INTO org_stations
  FROM operations_settings
  WHERE organization_id = NEW.organization_id;

  -- Validate primary station
  IF NEW.primary_station IS NOT NULL AND NOT (NEW.primary_station = ANY(org_stations)) THEN
    RAISE EXCEPTION 'primary_station must be one of the configured kitchen stations';
  END IF;

  -- Validate secondary station
  IF NEW.secondary_station IS NOT NULL AND NOT (NEW.secondary_station = ANY(org_stations)) THEN
    RAISE EXCEPTION 'secondary_station must be one of the configured kitchen stations';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for station validation
CREATE TRIGGER validate_recipe_stations_trigger
  BEFORE INSERT OR UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION validate_recipe_stations();

-- Add validation for equipment jsonb array
CREATE OR REPLACE FUNCTION validate_equipment_items()
 RETURNS trigger AS $$
BEGIN
  IF NOT (NEW.equipment @> '[]'::jsonb) THEN
    RAISE EXCEPTION 'equipment must be a JSON array';
  END IF;
  
  IF NOT (
    SELECT bool_and(
      jsonb_typeof(item -> 'id') = 'string' AND
      jsonb_typeof(item -> 'name') = 'string'
    )
    FROM jsonb_array_elements(NEW.equipment) item
  ) THEN
    RAISE EXCEPTION 'each equipment item must have id and name as strings';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for equipment validation
CREATE TRIGGER validate_equipment_items_trigger
  BEFORE INSERT OR UPDATE ON recipes
  FOR EACH ROW
  WHEN (NEW.equipment IS NOT NULL)
  EXECUTE FUNCTION validate_equipment_items();
