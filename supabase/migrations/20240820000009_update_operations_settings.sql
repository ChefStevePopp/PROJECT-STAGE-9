-- Add category_groups column to operations_settings table
ALTER TABLE operations_settings
ADD COLUMN IF NOT EXISTS category_groups JSONB;

-- Enable realtime for operations_settings
alter publication supabase_realtime add table operations_settings;
