-- Drop existing allergen columns if they exist
DO $$
BEGIN
  -- Drop all existing allergen columns
  ALTER TABLE master_ingredients
  DROP COLUMN IF EXISTS allergen_peanut,
  DROP COLUMN IF EXISTS allergen_crustacean,
  DROP COLUMN IF EXISTS allergen_treenut,
  DROP COLUMN IF EXISTS allergen_shellfish,
  DROP COLUMN IF EXISTS allergen_sesame,
  DROP COLUMN IF EXISTS allergen_soy,
  DROP COLUMN IF EXISTS allergen_fish,
  DROP COLUMN IF EXISTS allergen_wheat,
  DROP COLUMN IF EXISTS allergen_milk,
  DROP COLUMN IF EXISTS allergen_sulphite,
  DROP COLUMN IF EXISTS allergen_egg,
  DROP COLUMN IF EXISTS allergen_gluten,
  DROP COLUMN IF EXISTS allergen_mustard,
  DROP COLUMN IF EXISTS allergen_celery,
  DROP COLUMN IF EXISTS allergen_garlic,
  DROP COLUMN IF EXISTS allergen_onion,
  DROP COLUMN IF EXISTS allergen_nitrite,
  DROP COLUMN IF EXISTS allergen_mushroom,
  DROP COLUMN IF EXISTS allergen_hot_pepper,
  DROP COLUMN IF EXISTS allergen_citrus,
  DROP COLUMN IF EXISTS allergen_pork;

  -- Add allergen columns with proper defaults
  ALTER TABLE master_ingredients
  ADD COLUMN allergen_peanut BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_crustacean BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_treenut BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_shellfish BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_sesame BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_soy BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_fish BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_wheat BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_milk BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_sulphite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_egg BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_gluten BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_mustard BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_celery BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_garlic BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_onion BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_nitrite BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_mushroom BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_hot_pepper BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_citrus BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN allergen_pork BOOLEAN NOT NULL DEFAULT false;

  -- Add column for allergen notes
  ALTER TABLE master_ingredients
  ADD COLUMN IF NOT EXISTS allergen_notes TEXT;

  -- Add comment explaining allergen columns
  COMMENT ON TABLE master_ingredients IS 'Stores master ingredient data including allergen information';
END $$;