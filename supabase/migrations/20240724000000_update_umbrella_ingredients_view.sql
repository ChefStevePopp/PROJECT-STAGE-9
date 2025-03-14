-- Update umbrella_ingredients table to add major_group column
ALTER TABLE umbrella_ingredients ADD COLUMN IF NOT EXISTS major_group UUID REFERENCES food_category_groups(id);

-- Create or replace the view to include category names
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
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name,
  COALESCE(
    (SELECT jsonb_agg(uii.master_ingredient_id) 
     FROM umbrella_ingredient_items uii 
     WHERE uii.umbrella_ingredient_id = ui.id),
    '[]'::jsonb
  ) as master_ingredients
FROM umbrella_ingredients ui
LEFT JOIN food_category_groups fcg ON ui.major_group = fcg.id
LEFT JOIN food_categories fc ON ui.category = fc.id
LEFT JOIN food_sub_categories fsc ON ui.sub_category = fsc.id;

-- Create a function to get master ingredients for an umbrella ingredient
CREATE OR REPLACE FUNCTION get_umbrella_ingredient_master_ingredients(umbrella_id UUID)
RETURNS TABLE (
  id UUID,
  product TEXT,
  item_code TEXT,
  vendor TEXT,
  current_price NUMERIC,
  unit_of_measure TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.product,
    mi.item_code,
    mi.vendor,
    mi.current_price,
    mi.unit_of_measure
  FROM master_ingredients mi
  JOIN umbrella_ingredient_items uii ON mi.id = uii.master_ingredient_id
  WHERE uii.umbrella_ingredient_id = umbrella_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get umbrella ingredients with master ingredient details
CREATE OR REPLACE FUNCTION get_umbrella_ingredients_with_details(org_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  major_group UUID,
  category UUID,
  sub_category UUID,
  major_group_name TEXT,
  category_name TEXT,
  sub_category_name TEXT,
  master_ingredients JSONB,
  master_ingredient_details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.id,
    ui.name,
    ui.major_group,
    ui.category,
    ui.sub_category,
    fcg.name as major_group_name,
    fc.name as category_name,
    fsc.name as sub_category_name,
    COALESCE(
      (SELECT jsonb_agg(uii.master_ingredient_id) 
       FROM umbrella_ingredient_items uii 
       WHERE uii.umbrella_ingredient_id = ui.id),
      '[]'::jsonb
    ) as master_ingredients,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', mi.id,
        'product', mi.product,
        'item_code', mi.item_code,
        'vendor', mi.vendor,
        'current_price', mi.current_price,
        'unit_of_measure', mi.unit_of_measure
      ))
       FROM master_ingredients mi
       JOIN umbrella_ingredient_items uii ON mi.id = uii.master_ingredient_id
       WHERE uii.umbrella_ingredient_id = ui.id),
      '[]'::jsonb
    ) as master_ingredient_details
  FROM umbrella_ingredients ui
  LEFT JOIN food_category_groups fcg ON ui.major_group = fcg.id
  LEFT JOIN food_categories fc ON ui.category = fc.id
  LEFT JOIN food_sub_categories fsc ON ui.sub_category = fsc.id
  WHERE ui.organization_id = org_id;
END;
$$ LANGUAGE plpgsql;
