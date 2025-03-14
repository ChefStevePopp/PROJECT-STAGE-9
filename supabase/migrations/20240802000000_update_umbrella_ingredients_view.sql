-- Drop the existing view if it exists
DROP VIEW IF EXISTS public.umbrella_ingredients_with_details;

-- Recreate the view with the desired structure and additional fields from primary ingredient
CREATE VIEW public.umbrella_ingredients_with_details AS
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
  COALESCE(
    json_agg(uimi.master_ingredient_id) FILTER (WHERE uimi.master_ingredient_id IS NOT NULL),
    '[]'::json
  ) AS master_ingredients,
  fcg.name AS major_group_name,
  fc.name AS category_name,
  fsc.name AS sub_category_name,
  -- Add primary ingredient data
  pmi.recipe_unit_type,
  pmi.cost_per_recipe_unit,
  pmi.storage_area,
  pmi.allergen_peanut,
  pmi.allergen_crustacean,
  pmi.allergen_treenut,
  pmi.allergen_shellfish,
  pmi.allergen_sesame,
  pmi.allergen_soy,
  pmi.allergen_fish,
  pmi.allergen_wheat,
  pmi.allergen_milk,
  pmi.allergen_sulphite,
  pmi.allergen_egg,
  pmi.allergen_gluten,
  pmi.allergen_mustard,
  pmi.allergen_celery,
  pmi.allergen_garlic,
  pmi.allergen_onion,
  pmi.allergen_nitrite,
  pmi.allergen_mushroom,
  pmi.allergen_hot_pepper,
  pmi.allergen_citrus,
  pmi.allergen_pork,
  pmi.allergen_custom1_name,
  pmi.allergen_custom1_active,
  pmi.allergen_custom2_name,
  pmi.allergen_custom2_active,
  pmi.allergen_custom3_name,
  pmi.allergen_custom3_active,
  pmi.allergen_notes
FROM
  umbrella_ingredients ui
  LEFT JOIN umbrella_ingredient_master_ingredients uimi ON ui.id = uimi.umbrella_ingredient_id
  LEFT JOIN food_category_groups fcg ON ui.major_group = fcg.id
  LEFT JOIN food_categories fc ON ui.category = fc.id
  LEFT JOIN food_sub_categories fsc ON ui.sub_category = fsc.id
  -- Join with primary master ingredient
  LEFT JOIN master_ingredients pmi ON ui.primary_master_ingredient_id = pmi.id
GROUP BY
  ui.id, fcg.name, fc.name, fsc.name,
  pmi.recipe_unit_type, pmi.cost_per_recipe_unit, pmi.storage_area,
  pmi.allergen_peanut, pmi.allergen_crustacean, pmi.allergen_treenut,
  pmi.allergen_shellfish, pmi.allergen_sesame, pmi.allergen_soy,
  pmi.allergen_fish, pmi.allergen_wheat, pmi.allergen_milk,
  pmi.allergen_sulphite, pmi.allergen_egg, pmi.allergen_gluten,
  pmi.allergen_mustard, pmi.allergen_celery, pmi.allergen_garlic,
  pmi.allergen_onion, pmi.allergen_nitrite, pmi.allergen_mushroom,
  pmi.allergen_hot_pepper, pmi.allergen_citrus, pmi.allergen_pork,
  pmi.allergen_custom1_name, pmi.allergen_custom1_active,
  pmi.allergen_custom2_name, pmi.allergen_custom2_active,
  pmi.allergen_custom3_name, pmi.allergen_custom3_active,
  pmi.allergen_notes;

-- Grant permissions
GRANT SELECT ON public.umbrella_ingredients_with_details TO authenticated;
