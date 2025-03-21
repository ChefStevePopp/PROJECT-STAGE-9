-- Add archived column to food_category_groups
ALTER TABLE food_category_groups
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived column to food_categories
ALTER TABLE food_categories
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived column to food_sub_categories
ALTER TABLE food_sub_categories
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Update the realtime publication
alter publication supabase_realtime add table food_category_groups;
alter publication supabase_realtime add table food_categories;
alter publication supabase_realtime add table food_sub_categories;