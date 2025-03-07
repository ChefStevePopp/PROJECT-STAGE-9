-- Fix the schedules tables to use created_by instead of user_id

-- First, check if the schedules table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schedules') THEN
    -- Rename user_id column to created_by if it exists
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'user_id') THEN
      ALTER TABLE public.schedules RENAME COLUMN user_id TO created_by;
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'schedules' AND column_name = 'created_by') THEN
      ALTER TABLE public.schedules ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
  END IF;
  
  -- Do the same for schedule_shifts table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'schedule_shifts') THEN
    -- Rename user_id column to created_by if it exists
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'schedule_shifts' AND column_name = 'user_id') THEN
      ALTER TABLE public.schedule_shifts RENAME COLUMN user_id TO created_by;
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'schedule_shifts' AND column_name = 'created_by') THEN
      ALTER TABLE public.schedule_shifts ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
  END IF;
  
  -- Do the same for seven_shifts_integrations table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'seven_shifts_integrations') THEN
    -- Rename user_id column to created_by if it exists
    IF EXISTS (SELECT FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'seven_shifts_integrations' AND column_name = 'user_id') THEN
      ALTER TABLE public.seven_shifts_integrations RENAME COLUMN user_id TO created_by;
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_schema = 'public' AND table_name = 'seven_shifts_integrations' AND column_name = 'created_by') THEN
      ALTER TABLE public.seven_shifts_integrations ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
  END IF;
END $$;

-- Update RLS policies to use created_by instead of user_id
DO $$ 
BEGIN
  -- Drop existing policies if they reference user_id
  DROP POLICY IF EXISTS "Users can view their own schedules" ON public.schedules;
  DROP POLICY IF EXISTS "Users can update their own schedules" ON public.schedules;
  DROP POLICY IF EXISTS "Users can delete their own schedules" ON public.schedules;
  
  -- Create new policies using created_by
  CREATE POLICY "Users can view their own schedules"
    ON public.schedules FOR SELECT
    USING (auth.uid() = created_by OR 
           EXISTS (SELECT 1 FROM public.organization_team_members 
                  WHERE user_id = auth.uid() AND organization_id = organization_id));
  
  CREATE POLICY "Users can update their own schedules"
    ON public.schedules FOR UPDATE
    USING (auth.uid() = created_by OR 
           EXISTS (SELECT 1 FROM public.organization_team_members 
                  WHERE user_id = auth.uid() AND organization_id = organization_id));
  
  CREATE POLICY "Users can delete their own schedules"
    ON public.schedules FOR DELETE
    USING (auth.uid() = created_by);
  
  -- Do the same for schedule_shifts
  DROP POLICY IF EXISTS "Users can view their own schedule shifts" ON public.schedule_shifts;
  DROP POLICY IF EXISTS "Users can update their own schedule shifts" ON public.schedule_shifts;
  DROP POLICY IF EXISTS "Users can delete their own schedule shifts" ON public.schedule_shifts;
  
  CREATE POLICY "Users can view their own schedule shifts"
    ON public.schedule_shifts FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.schedules 
                  WHERE id = schedule_id AND 
                  (auth.uid() = schedules.created_by OR 
                   EXISTS (SELECT 1 FROM public.organization_team_members 
                          WHERE user_id = auth.uid() AND organization_id = schedules.organization_id))));
  
  CREATE POLICY "Users can update their own schedule shifts"
    ON public.schedule_shifts FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.schedules 
                  WHERE id = schedule_id AND 
                  (auth.uid() = schedules.created_by OR 
                   EXISTS (SELECT 1 FROM public.organization_team_members 
                          WHERE user_id = auth.uid() AND organization_id = schedules.organization_id))));
  
  CREATE POLICY "Users can delete their own schedule shifts"
    ON public.schedule_shifts FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.schedules 
                  WHERE id = schedule_id AND auth.uid() = schedules.created_by));
  
  -- Do the same for seven_shifts_integrations
  DROP POLICY IF EXISTS "Users can view their own integrations" ON public.seven_shifts_integrations;
  DROP POLICY IF EXISTS "Users can update their own integrations" ON public.seven_shifts_integrations;
  DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.seven_shifts_integrations;
  
  CREATE POLICY "Users can view their own integrations"
    ON public.seven_shifts_integrations FOR SELECT
    USING (auth.uid() = created_by OR 
           EXISTS (SELECT 1 FROM public.organization_team_members 
                  WHERE user_id = auth.uid() AND organization_id = organization_id));
  
  CREATE POLICY "Users can update their own integrations"
    ON public.seven_shifts_integrations FOR UPDATE
    USING (auth.uid() = created_by OR 
           EXISTS (SELECT 1 FROM public.organization_team_members 
                  WHERE user_id = auth.uid() AND organization_id = organization_id));
  
  CREATE POLICY "Users can delete their own integrations"
    ON public.seven_shifts_integrations FOR DELETE
    USING (auth.uid() = created_by);
 END $$;
