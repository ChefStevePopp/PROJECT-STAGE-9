-- Add format_type column to csv_mappings if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'csv_mappings' AND column_name = 'format_type') THEN
    ALTER TABLE csv_mappings ADD COLUMN format_type TEXT;
  END IF;
END $$;

-- Refresh the schema cache to ensure all columns are recognized
NOTIFY pgrst, 'reload schema';
