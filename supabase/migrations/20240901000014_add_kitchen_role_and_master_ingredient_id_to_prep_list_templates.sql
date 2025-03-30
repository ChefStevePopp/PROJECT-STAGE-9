-- Add kitchen_role and master_ingredient_id columns to prep_list_templates table
ALTER TABLE prep_list_templates ADD COLUMN IF NOT EXISTS kitchen_role TEXT;
ALTER TABLE prep_list_templates ADD COLUMN IF NOT EXISTS master_ingredient_id UUID REFERENCES master_ingredients(id) ON DELETE SET NULL;