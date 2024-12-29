-- Add allergen columns to prepared_items table
ALTER TABLE prepared_items
ADD COLUMN allergen_peanut BOOLEAN DEFAULT false,
ADD COLUMN allergen_crustacean BOOLEAN DEFAULT false,
ADD COLUMN allergen_treenut BOOLEAN DEFAULT false,
ADD COLUMN allergen_shellfish BOOLEAN DEFAULT false,
ADD COLUMN allergen_sesame BOOLEAN DEFAULT false,
ADD COLUMN allergen_soy BOOLEAN DEFAULT false,
ADD COLUMN allergen_fish BOOLEAN DEFAULT false,
ADD COLUMN allergen_wheat BOOLEAN DEFAULT false,
ADD COLUMN allergen_milk BOOLEAN DEFAULT false,
ADD COLUMN allergen_sulphite BOOLEAN DEFAULT false,
ADD COLUMN allergen_egg BOOLEAN DEFAULT false,
ADD COLUMN allergen_gluten BOOLEAN DEFAULT false,
ADD COLUMN allergen_mustard BOOLEAN DEFAULT false,
ADD COLUMN allergen_celery BOOLEAN DEFAULT false,
ADD COLUMN allergen_garlic BOOLEAN DEFAULT false,
ADD COLUMN allergen_onion BOOLEAN DEFAULT false,
ADD COLUMN allergen_nitrite BOOLEAN DEFAULT false,
ADD COLUMN allergen_mushroom BOOLEAN DEFAULT false,
ADD COLUMN allergen_hot_pepper BOOLEAN DEFAULT false,
ADD COLUMN allergen_citrus BOOLEAN DEFAULT false,
ADD COLUMN allergen_pork BOOLEAN DEFAULT false;

-- Add columns for future allergens
ADD COLUMN allergen_custom1 BOOLEAN DEFAULT false,
ADD COLUMN allergen_custom2 BOOLEAN DEFAULT false,
ADD COLUMN allergen_custom3 BOOLEAN DEFAULT false;

-- Add column for allergen notes
ADD COLUMN allergen_notes TEXT;

-- Add comment explaining allergen columns
COMMENT ON TABLE prepared_items IS 'Stores prepared item data including detailed allergen information';
COMMENT ON COLUMN prepared_items.allergen_notes IS 'Additional notes about allergens or special handling requirements';