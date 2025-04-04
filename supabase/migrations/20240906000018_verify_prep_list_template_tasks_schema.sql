-- First, let's check if all required columns exist and add any missing ones

-- Check if assignee_id column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'assignee_id') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN assignee_id UUID REFERENCES organization_team_members(id);
  END IF;
END $$;

-- Check if due_date column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'due_date') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Check if kitchen_station column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'kitchen_station') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN kitchen_station TEXT;
  END IF;
END $$;

-- Check if master_ingredient_id column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'master_ingredient_id') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN master_ingredient_id UUID REFERENCES master_ingredients(id);
  END IF;
END $$;

-- Check if recipe_id column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'recipe_id') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN recipe_id UUID REFERENCES recipes(id);
  END IF;
END $$;

-- Check if status column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'status') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Check if priority column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'priority') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN priority INTEGER DEFAULT 0;
  END IF;
END $$;

-- Check if description column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'description') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN description TEXT;
  END IF;
END $$;

-- Check if quantity column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'quantity') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN quantity NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Check if unit column exists, add if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'prep_list_template_tasks' AND column_name = 'unit') THEN
    ALTER TABLE prep_list_template_tasks ADD COLUMN unit TEXT;
  END IF;
END $$;

-- Table is already included in the realtime publication, no need to add it again