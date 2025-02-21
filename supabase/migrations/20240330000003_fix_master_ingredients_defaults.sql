-- Set default values for required fields
ALTER TABLE master_ingredients
  ALTER COLUMN major_group SET DEFAULT '',
  ALTER COLUMN category SET DEFAULT '',
  ALTER COLUMN sub_category SET DEFAULT '',
  ALTER COLUMN vendor SET DEFAULT '',
  ALTER COLUMN item_code SET DEFAULT '',
  ALTER COLUMN unit_of_measure SET DEFAULT '',
  ALTER COLUMN product SET DEFAULT '',
  ALTER COLUMN current_price SET DEFAULT 0,
  ALTER COLUMN recipe_unit_per_purchase_unit SET DEFAULT 0,
  ALTER COLUMN units_per_case SET DEFAULT 0,
  ALTER COLUMN yield_percent SET DEFAULT 100;

-- Update existing null values
UPDATE master_ingredients SET
  major_group = COALESCE(major_group, ''),
  category = COALESCE(category, ''),
  sub_category = COALESCE(sub_category, ''),
  vendor = COALESCE(vendor, ''),
  item_code = COALESCE(item_code, ''),
  unit_of_measure = COALESCE(unit_of_measure, ''),
  product = COALESCE(product, ''),
  current_price = COALESCE(current_price, 0),
  recipe_unit_per_purchase_unit = COALESCE(recipe_unit_per_purchase_unit, 0),
  units_per_case = COALESCE(units_per_case, 0),
  yield_percent = COALESCE(yield_percent, 100);