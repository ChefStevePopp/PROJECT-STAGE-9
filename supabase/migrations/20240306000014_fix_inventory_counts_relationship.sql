-- Drop and recreate the foreign key constraint with proper reference
ALTER TABLE inventory_counts
DROP CONSTRAINT IF EXISTS inventory_counts_master_ingredient_fk;

ALTER TABLE inventory_counts
ADD CONSTRAINT inventory_counts_master_ingredient_fk 
FOREIGN KEY (master_ingredient_id, organization_id) 
REFERENCES master_ingredients(id, organization_id) 
ON DELETE CASCADE;

-- Add comment explaining the relationship
COMMENT ON CONSTRAINT inventory_counts_master_ingredient_fk 
ON inventory_counts 
IS 'Links inventory counts to master ingredients within the same organization';