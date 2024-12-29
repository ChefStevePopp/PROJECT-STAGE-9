-- Create a function to handle recipe creation with ingredients in a transaction
CREATE OR REPLACE FUNCTION create_recipe(
  recipe_data jsonb,
  ingredients jsonb[]
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipe_id uuid;
BEGIN
  -- Insert recipe
  INSERT INTO recipes (
    organization_id,
    type,
    name,
    category,
    sub_category,
    station,
    storage_area,
    container,
    container_type,
    shelf_life,
    description,
    prep_time,
    cook_time,
    recipe_unit_ratio,
    unit_type,
    cost_per_ratio_unit,
    cost_per_serving,
    instructions,
    notes,
    image_url,
    video_url,
    allergens
  )
  SELECT
    (recipe_data->>'organization_id')::uuid,
    recipe_data->>'type',
    recipe_data->>'name',
    recipe_data->>'category',
    recipe_data->>'sub_category',
    recipe_data->>'station',
    recipe_data->>'storage_area',
    recipe_data->>'container',
    recipe_data->>'container_type',
    recipe_data->>'shelf_life',
    recipe_data->>'description',
    (recipe_data->>'prep_time')::integer,
    (recipe_data->>'cook_time')::integer,
    recipe_data->>'recipe_unit_ratio',
    recipe_data->>'unit_type',
    (recipe_data->>'cost_per_ratio_unit')::decimal,
    (recipe_data->>'cost_per_serving')::decimal,
    ARRAY(SELECT jsonb_array_elements_text(recipe_data->'instructions')),
    recipe_data->>'notes',
    recipe_data->>'image_url',
    recipe_data->>'video_url',
    ARRAY(SELECT jsonb_array_elements_text(recipe_data->'allergens'))
  RETURNING id INTO recipe_id;

  -- Insert ingredients
  INSERT INTO recipe_ingredients (
    recipe_id,
    type,
    name,
    quantity,
    unit,
    cost,
    notes,
    prepared_item_id
  )
  SELECT
    recipe_id,
    ingredient->>'type',
    ingredient->>'name',
    (ingredient->>'quantity')::decimal,
    ingredient->>'unit',
    (ingredient->>'cost')::decimal,
    ingredient->>'notes',
    (ingredient->>'prepared_item_id')::uuid
  FROM unnest(ingredients) AS ingredient;

  RETURN recipe_id;
END;
$$;