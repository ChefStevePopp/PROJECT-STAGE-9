-- Fix the inventory_counts table schema to properly handle total_value as a generated column
ALTER TABLE IF EXISTS public.inventory_counts
  DROP COLUMN IF EXISTS total_value;

ALTER TABLE IF EXISTS public.inventory_counts
  ADD COLUMN total_value numeric GENERATED ALWAYS AS (quantity * unit_cost) STORED;

-- Make sure the count_date is timestamp with time zone instead of date
ALTER TABLE IF EXISTS public.inventory_counts
  ALTER COLUMN count_date TYPE timestamp with time zone;

-- Enable realtime for inventory_counts
alter publication supabase_realtime add table inventory_counts;
