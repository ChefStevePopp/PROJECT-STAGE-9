-- First, drop the table from the publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Recreate the publication
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

-- Add columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'amount_required') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN amount_required NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'status') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'master_ingredient_id') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN master_ingredient_id UUID REFERENCES master_ingredients(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'master_ingredient_name') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN master_ingredient_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'case_size') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN case_size TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'units_per_case') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN units_per_case TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'storage_area') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN storage_area TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'unit_of_measure') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN unit_of_measure TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'measurement_type') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN measurement_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'on_hand') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN on_hand NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'par_level') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN par_level NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'current_level') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN current_level NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'schedule_days') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN schedule_days INTEGER[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'kitchen_station') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN kitchen_station TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'team_member_role') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN team_member_role TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'assignee_id') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN assignee_id UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'due_date') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN due_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'organization_id') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prep_list_template_tasks' AND column_name = 'prep_system') THEN
        ALTER TABLE prep_list_template_tasks ADD COLUMN prep_system TEXT DEFAULT 'as_needed';
    END IF;
END $$;