-- Drop the existing view if it exists
DROP VIEW IF EXISTS public.umbrella_ingredients_with_details;

-- Recreate the view with the desired structure
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
  fsc.name AS sub_category_name
FROM
  umbrella_ingredients ui
  LEFT JOIN umbrella_ingredient_master_ingredients uimi ON ui.id = uimi.umbrella_ingredient_id
  LEFT JOIN food_category_groups fcg ON ui.major_group = fcg.id
  LEFT JOIN food_categories fc ON ui.category = fc.id
  LEFT JOIN food_sub_categories fsc ON ui.sub_category = fsc.id
GROUP BY
  ui.id, fcg.name, fc.name, fsc.name;

-- Grant permissions
GRANT SELECT ON public.umbrella_ingredients_with_details TO authenticated;
