-- Fix inventory_counts table to make total_value a generated column
ALTER TABLE inventory_counts
DROP COLUMN IF EXISTS total_value;

ALTER TABLE inventory_counts
ADD COLUMN total_value numeric GENERATED ALWAYS AS (quantity * unit_cost) STORED;
