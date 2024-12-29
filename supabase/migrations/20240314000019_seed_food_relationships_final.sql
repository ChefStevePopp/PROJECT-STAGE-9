-- Re-seed initial data for Memphis Fire BBQ
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
  food_group_id uuid;
  beverage_group_id uuid;
  alcohol_group_id uuid;
  supplies_group_id uuid;
  proteins_cat_id uuid;
  produce_cat_id uuid;
  dairy_cat_id uuid;
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
  (org_id, food_group_id, 'Proteins', 'Meat, poultry, and seafood', 1)
  RETURNING id INTO proteins_cat_id;

  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, food_group_id, 'Produce', 'Fresh fruits and vegetables', 2)
  RETURNING id INTO produce_cat_id;

  INSERT INTO food_categories (
    organization_id,
    group_id,
    name,
    description,
    sort_order
  ) VALUES 
  (org_id, food_group_id, 'Dairy', 'Milk products and eggs', 3)
  RETURNING id INTO dairy_cat_id;

  -- Create sub-categories
  INSERT INTO food_sub_categories (
    organization_id,
    category_id,
    name,
    description,
    sort_order
  ) VALUES
  -- Protein sub-categories
  (org_id, proteins_cat_id, 'Beef', 'All beef products', 1),
  (org_id, proteins_cat_id, 'Pork', 'All pork products', 2),
  (org_id, proteins_cat_id, 'Poultry', 'Chicken and turkey products', 3),
  -- Produce sub-categories
  (org_id, produce_cat_id, 'Fresh Vegetables', 'Fresh vegetables', 1),
  (org_id, produce_cat_id, 'Fresh Fruits', 'Fresh fruits', 2),
  (org_id, produce_cat_id, 'Herbs', 'Fresh herbs', 3),
  -- Dairy sub-categories
  (org_id, dairy_cat_id, 'Milk', 'Fresh milk products', 1),
  (org_id, dairy_cat_id, 'Cheese', 'Cheese products', 2),
  (org_id, dairy_cat_id, 'Eggs', 'Fresh eggs', 3);

END $$;