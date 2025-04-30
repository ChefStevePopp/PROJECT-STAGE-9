-- Drop the existing view
DROP VIEW IF EXISTS public.master_ingredients_with_categories;

-- Recreate the view with the archived column
CREATE VIEW public.master_ingredients_with_categories AS
SELECT
  mi.id,
  mi.created_at,
  mi.updated_at,
  mi.organization_id,
  mi.item_code,
  mi.major_group,
  mi.category,
  mi.sub_category,
  mi.product,
  mi.vendor,
  mi.case_size,
  mi.units_per_case,
  mi.current_price,
  mi.unit_of_measure,
  mi.recipe_unit_per_purchase_unit,
  mi.recipe_unit_type,
  mi.yield_percent,
  mi.cost_per_recipe_unit,
  mi.image_url,
  mi.storage_area,
  mi.inventory_unit_cost,
  mi.allergen_peanut,
  mi.allergen_crustacean,
  mi.allergen_treenut,
  mi.allergen_shellfish,
  mi.allergen_sesame,
  mi.allergen_soy,
  mi.allergen_fish,
  mi.allergen_wheat,
  mi.allergen_milk,
  mi.allergen_sulphite,
  mi.allergen_egg,
  mi.allergen_gluten,
  mi.allergen_mustard,
  mi.allergen_celery,
  mi.allergen_garlic,
  mi.allergen_onion,
  mi.allergen_nitrite,
  mi.allergen_mushroom,
  mi.allergen_hot_pepper,
  mi.allergen_citrus,
  mi.allergen_pork,
  mi.allergen_custom1_name,
  mi.allergen_custom1_active,
  mi.allergen_custom2_name,
  mi.allergen_custom2_active,
  mi.allergen_custom3_name,
  mi.allergen_custom3_active,
  mi.allergen_notes,
  mi.archived,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name,
  (
    select
      json_build_object(
        'current',
        json_build_object('code', vc.code, 'vendor_id', vc.vendor_id),
        'history',
        json_agg(
          json_build_object(
            'code',
            vh.code,
            'vendor_id',
            vh.vendor_id,
            'updated_at',
            vh.updated_at
          )
        )
      ) as json_build_object
    from
      vendor_codes vc
      left join vendor_codes vh on mi.id = vh.master_ingredient_id
      and vh.is_current = false
    where
      mi.id = vc.master_ingredient_id
      and vc.is_current = true
    group by
      vc.code,
      vc.vendor_id
    limit
      1
  ) as vendor_codes
from
  master_ingredients mi
  left join food_category_groups fcg on mi.major_group = fcg.id
  left join food_categories fc on mi.category = fc.id
  left join food_sub_categories fsc on mi.sub_category = fsc.id;