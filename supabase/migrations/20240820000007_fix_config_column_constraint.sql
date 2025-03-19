-- Make config column nullable or provide a default value
ALTER TABLE csv_mappings ALTER COLUMN config DROP NOT NULL;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
