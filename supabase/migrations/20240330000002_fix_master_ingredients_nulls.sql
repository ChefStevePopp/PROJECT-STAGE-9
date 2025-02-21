-- Update master_ingredients table to handle nulls better
ALTER TABLE master_ingredients
  ALTER COLUMN organization_id SET NOT NULL,
  ALTER COLUMN major_group SET DEFAULT '',
  ALTER COLUMN category SET DEFAULT '',
  ALTER COLUMN sub_category SET DEFAULT '',
  ALTER COLUMN vendor SET DEFAULT '',
  ALTER COLUMN item_code SET DEFAULT '',
  ALTER COLUMN unit_of_measure SET DEFAULT '',
  ALTER COLUMN product SET DEFAULT '';

-- Update existing null values
UPDATE master_ingredients
SET 
  major_group = COALESCE(major_group, ''),
  category = COALESCE(category, ''),
  sub_category = COALESCE(sub_category, ''),
  vendor = COALESCE(vendor, ''),
  item_code = COALESCE(item_code, ''),
  unit_of_measure = COALESCE(unit_of_measure, ''),
  product = COALESCE(product, '');