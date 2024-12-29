-- Insert initial food category groups for Memphis Fire BBQ
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
  food_group_id uuid;
  beverage_group_id uuid;
  alcohol_group_id uuid;
  supplies_group_id uuid;
BEGIN
  -- Create Food group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Food',
    'All food items including raw ingredients and prepared items',
    'Package',
    'primary',
    1
  ) RETURNING id INTO food_group_id;

  -- Create Beverage group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Beverage',
    'Non-alcoholic beverages including soft drinks and juices',
    'Coffee',
    'amber',
    2
  ) RETURNING id INTO beverage_group_id;

  -- Create Alcohol group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Alcohol',
    'Alcoholic beverages including beer, wine, and spirits',
    'Wine',
    'rose',
    3
  ) RETURNING id INTO alcohol_group_id;

  -- Create Supplies group
  INSERT INTO food_category_groups (
    organization_id,
    name,
    description,
    icon,
    color,
    sort_order
  ) VALUES (
    org_id,
    'Supplies',
    'Non-food items including packaging and cleaning supplies',
    'Box',
    'purple',
    4
  ) RETURNING id INTO supplies_group_id;

  -- Create food categories
  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  -- Food categories
  (org_id, food_group_id, 'Proteins', 'Meat, poultry, and seafood', 1),
  (org_id, food_group_id, 'Produce', 'Fresh fruits and vegetables', 2),
  (org_id, food_group_id, 'Dairy', 'Milk products and eggs', 3),
  (org_id, food_group_id, 'Dry Goods', 'Shelf-stable ingredients', 4),
  -- Beverage categories
  (org_id, beverage_group_id, 'Hot Beverages', 'Coffee, tea, and hot chocolate', 1),
  (org_id, beverage_group_id, 'Cold Beverages', 'Soft drinks and juices', 2),
  -- Alcohol categories
  (org_id, alcohol_group_id, 'Beer', 'All types of beer', 1),
  (org_id, alcohol_group_id, 'Wine', 'Red, white, and sparkling wines', 2),
  (org_id, alcohol_group_id, 'Spirits', 'Distilled beverages', 3),
  -- Supplies categories
  (org_id, supplies_group_id, 'Packaging', 'To-go containers and supplies', 1),
  (org_id, supplies_group_id, 'Cleaning', 'Cleaning supplies and chemicals', 2),
  (org_id, supplies_group_id, 'Equipment', 'Kitchen equipment and tools', 3);

END $$;