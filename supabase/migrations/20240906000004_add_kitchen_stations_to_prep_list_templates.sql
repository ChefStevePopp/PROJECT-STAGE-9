-- Add kitchen_stations column to prep_list_templates table
ALTER TABLE prep_list_templates ADD COLUMN IF NOT EXISTS kitchen_stations TEXT[] DEFAULT '{}'::TEXT[];
