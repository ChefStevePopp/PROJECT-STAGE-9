-- Check if kitchen_stations column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'prep_lists'
        AND column_name = 'kitchen_stations'
    ) THEN
        ALTER TABLE prep_lists ADD COLUMN kitchen_stations TEXT[] DEFAULT '{}';
    END IF;
END $$;