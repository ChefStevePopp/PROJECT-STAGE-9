-- Add allergen columns to master_ingredients table
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS allergen_peanut BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_crustacean BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_treenut BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_shellfish BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_sesame BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_soy BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_fish BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_wheat BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_milk BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_sulphite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_egg BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_gluten BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_mustard BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_celery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_garlic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_onion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_nitrite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_mushroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_hot_pepper BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_citrus BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_pork BOOLEAN DEFAULT false;

-- Add column for allergen notes
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS allergen_notes TEXT;

-- Add comment explaining allergen columns
COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data including allergen information';