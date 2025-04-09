-- Add amount_required column to prep_list_template_tasks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'amount_required') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN amount_required NUMERIC DEFAULT 0;
    END IF;
END
$$;