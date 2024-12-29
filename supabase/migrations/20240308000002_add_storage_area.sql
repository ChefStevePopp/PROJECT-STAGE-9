-- Add storage_area column to master_ingredients table
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS storage_area TEXT;

-- Add index for storage area queries
CREATE INDEX IF NOT EXISTS idx_master_ingredients_storage_area 
ON master_ingredients(storage_area);

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.storage_area IS 'Storage location for the ingredient (e.g., Walk-in Cooler, Dry Storage)';

-- Update existing rows to use default storage area if needed
UPDATE master_ingredients 
SET storage_area = 'Dry Storage'
WHERE storage_area IS NULL;