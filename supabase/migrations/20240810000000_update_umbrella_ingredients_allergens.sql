-- Add custom allergen fields to umbrella_ingredients table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrella_ingredients' AND column_name = 'allergen_custom1_name') THEN
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_custom1_name text;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_custom1_active boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_custom2_name text;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_custom2_active boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_custom3_name text;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_custom3_active boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_notes text;
    END IF;
    
    -- Add recipe unit type and cost per recipe unit if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrella_ingredients' AND column_name = 'recipe_unit_type') THEN
        ALTER TABLE umbrella_ingredients ADD COLUMN recipe_unit_type text;
        ALTER TABLE umbrella_ingredients ADD COLUMN cost_per_recipe_unit numeric DEFAULT 0;
    END IF;
    
    -- Add storage area if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrella_ingredients' AND column_name = 'storage_area') THEN
        ALTER TABLE umbrella_ingredients ADD COLUMN storage_area text;
    END IF;
    
    -- Add all allergen fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'umbrella_ingredients' AND column_name = 'allergen_peanut') THEN
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_peanut boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_crustacean boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_treenut boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_shellfish boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_sesame boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_soy boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_fish boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_wheat boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_milk boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_sulphite boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_egg boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_gluten boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_mustard boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_celery boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_garlic boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_onion boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_nitrite boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_mushroom boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_hot_pepper boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_citrus boolean DEFAULT false;
        ALTER TABLE umbrella_ingredients ADD COLUMN allergen_pork boolean DEFAULT false;
    END IF;
END $$;

-- Update the umbrella_ingredients_with_details view to include all allergen fields
CREATE OR REPLACE VIEW umbrella_ingredients_with_details AS
SELECT 
    ui.id,
    ui.organization_id,
    ui.name,
    ui.description,
    ui.major_group,
    ui.category,
    ui.sub_category,
    ui.primary_master_ingredient_id,
    ui.created_at,
    ui.updated_at,
    ui.recipe_unit_type,
    ui.cost_per_recipe_unit,
    ui.storage_area,
    ui.allergen_peanut,
    ui.allergen_crustacean,
    ui.allergen_treenut,
    ui.allergen_shellfish,
    ui.allergen_sesame,
    ui.allergen_soy,
    ui.allergen_fish,
    ui.allergen_wheat,
    ui.allergen_milk,
    ui.allergen_sulphite,
    ui.allergen_egg,
    ui.allergen_gluten,
    ui.allergen_mustard,
    ui.allergen_celery,
    ui.allergen_garlic,
    ui.allergen_onion,
    ui.allergen_nitrite,
    ui.allergen_mushroom,
    ui.allergen_hot_pepper,
    ui.allergen_citrus,
    ui.allergen_pork,
    ui.allergen_custom1_name,
    ui.allergen_custom1_active,
    ui.allergen_custom2_name,
    ui.allergen_custom2_active,
    ui.allergen_custom3_name,
    ui.allergen_custom3_active,
    ui.allergen_notes,
    fcg.name AS major_group_name,
    fc.name AS category_name,
    fsc.name AS sub_category_name,
    ARRAY(
        SELECT uimi.master_ingredient_id
        FROM umbrella_ingredient_master_ingredients uimi
        WHERE uimi.umbrella_ingredient_id = ui.id
    ) AS master_ingredients
FROM 
    umbrella_ingredients ui
LEFT JOIN 
    food_category_groups fcg ON ui.major_group = fcg.id
LEFT JOIN 
    food_categories fc ON ui.category = fc.id
LEFT JOIN 
    food_sub_categories fsc ON ui.sub_category = fsc.id;
