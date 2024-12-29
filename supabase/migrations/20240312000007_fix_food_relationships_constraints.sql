-- First ensure food_category_groups has proper constraints
ALTER TABLE food_category_groups
DROP CONSTRAINT IF EXISTS food_category_groups_pkey CASCADE,
DROP CONSTRAINT IF EXISTS food_category_groups_org_name_key CASCADE,
ADD CONSTRAINT food_category_groups_pkey PRIMARY KEY (id),
ADD CONSTRAINT food_category_groups_org_name_key UNIQUE (organization_id, name);

-- Add constraints to food_categories
ALTER TABLE food_categories
DROP CONSTRAINT IF EXISTS food_categories_pkey CASCADE,
DROP CONSTRAINT IF EXISTS food_categories_org_group_name_key CASCADE,
ADD CONSTRAINT food_categories_pkey PRIMARY KEY (id),
ADD CONSTRAINT food_categories_org_group_name_key UNIQUE (organization_id, group_id, name);

-- Add constraints to food_sub_categories
ALTER TABLE food_sub_categories
DROP CONSTRAINT IF EXISTS food_sub_categories_pkey CASCADE,
DROP CONSTRAINT IF EXISTS food_sub_categories_org_cat_name_key CASCADE,
ADD CONSTRAINT food_sub_categories_pkey PRIMARY KEY (id),
ADD CONSTRAINT food_sub_categories_org_cat_name_key UNIQUE (organization_id, category_id, name);

-- Now we can safely add the foreign key constraints to master_ingredients
ALTER TABLE master_ingredients
DROP CONSTRAINT IF EXISTS master_ingredients_major_group_fk CASCADE,
DROP CONSTRAINT IF EXISTS master_ingredients_category_fk CASCADE,
DROP CONSTRAINT IF EXISTS master_ingredients_sub_category_fk CASCADE;

ALTER TABLE master_ingredients
ADD CONSTRAINT master_ingredients_major_group_fk
FOREIGN KEY (major_group) 
REFERENCES food_category_groups(id)
ON DELETE SET NULL,

ADD CONSTRAINT master_ingredients_category_fk
FOREIGN KEY (category) 
REFERENCES food_categories(id)
ON DELETE SET NULL,

ADD CONSTRAINT master_ingredients_sub_category_fk
FOREIGN KEY (sub_category) 
REFERENCES food_sub_categories(id)
ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_category_groups_org 
ON food_category_groups(organization_id);

CREATE INDEX IF NOT EXISTS idx_food_categories_org_group 
ON food_categories(organization_id, group_id);

CREATE INDEX IF NOT EXISTS idx_food_sub_categories_org_cat 
ON food_sub_categories(organization_id, category_id);

-- Add helpful comments
COMMENT ON TABLE food_category_groups IS 'Top-level food category groups';
COMMENT ON TABLE food_categories IS 'Categories within food groups';
COMMENT ON TABLE food_sub_categories IS 'Sub-categories within food categories';