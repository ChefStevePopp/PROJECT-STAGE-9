-- Add image_url column to master_ingredients
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN master_ingredients.image_url IS 'URL to product image, typically from import source';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_master_ingredients_image_url ON master_ingredients(image_url);