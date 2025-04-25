-- Step 1: Drop the existing generated column
ALTER TABLE public.inventory_counts DROP COLUMN total_value;

-- Step 2: Add it back as a regular column
ALTER TABLE public.inventory_counts ADD COLUMN total_value numeric;

-- Step 3: Update the existing rows to calculate the value
UPDATE public.inventory_counts SET total_value = quantity * unit_cost;
