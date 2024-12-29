-- Add custom allergen columns to master_ingredients table
ALTER TABLE master_ingredients
ADD COLUMN IF NOT EXISTS allergen_custom1_name TEXT,
ADD COLUMN IF NOT EXISTS allergen_custom1_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_custom2_name TEXT,
ADD COLUMN IF NOT EXISTS allergen_custom2_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allergen_custom3_name TEXT,
ADD COLUMN IF NOT EXISTS allergen_custom3_active BOOLEAN DEFAULT false;

-- Add indexes for custom allergens
CREATE INDEX IF NOT EXISTS idx_master_ingredients_custom1 ON master_ingredients(allergen_custom1_active) WHERE allergen_custom1_active = true;
CREATE INDEX IF NOT EXISTS idx_master_ingredients_custom2 ON master_ingredients(allergen_custom2_active) WHERE allergen_custom2_active = true;
CREATE INDEX IF NOT EXISTS idx_master_ingredients_custom3 ON master_ingredients(allergen_custom3_active) WHERE allergen_custom3_active = true;