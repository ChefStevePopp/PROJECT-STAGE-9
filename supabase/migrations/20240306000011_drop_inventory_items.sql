-- Drop the inventory_items table since we're using master_ingredients
DROP TABLE IF EXISTS inventory_items CASCADE;

-- Add indexes to master_ingredients if they don't exist
CREATE INDEX IF NOT EXISTS idx_master_ingredients_org_id ON master_ingredients(organization_id);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_unique_id ON master_ingredients(unique_id);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_product ON master_ingredients(product);
CREATE INDEX IF NOT EXISTS idx_master_ingredients_category ON master_ingredients(category);