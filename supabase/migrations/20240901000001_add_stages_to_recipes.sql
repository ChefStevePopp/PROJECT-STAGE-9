-- Add stages column to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS stages JSONB DEFAULT '[]'::jsonb;
