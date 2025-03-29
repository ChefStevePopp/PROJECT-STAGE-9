-- Add recipe_id column to prep_list_templates table
ALTER TABLE prep_list_templates ADD COLUMN IF NOT EXISTS recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL;
