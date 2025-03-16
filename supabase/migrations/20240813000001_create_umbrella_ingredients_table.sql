-- Create umbrella_ingredients table
CREATE TABLE IF NOT EXISTS public.umbrella_ingredients (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  organization_id uuid NOT NULL,
  name text NOT NULL,
  description text NULL,
  major_group uuid NULL,
  category uuid NULL,
  sub_category uuid NULL,
  primary_master_ingredient_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT umbrella_ingredients_pkey PRIMARY KEY (id),
  CONSTRAINT umbrella_ingredients_category_fkey FOREIGN KEY (category) REFERENCES food_categories (id),
  CONSTRAINT umbrella_ingredients_major_group_fkey FOREIGN KEY (major_group) REFERENCES food_category_groups (id),
  CONSTRAINT umbrella_ingredients_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id),
  CONSTRAINT umbrella_ingredients_primary_master_ingredient_id_fkey FOREIGN KEY (primary_master_ingredient_id) REFERENCES master_ingredients (id),
  CONSTRAINT umbrella_ingredients_sub_category_fkey FOREIGN KEY (sub_category) REFERENCES food_sub_categories (id)
);

-- Create RLS policies
ALTER TABLE public.umbrella_ingredients ENABLE ROW LEVEL SECURITY;

-- Policy for select
DROP POLICY IF EXISTS "Users can view their organization's umbrella ingredients" ON public.umbrella_ingredients;
CREATE POLICY "Users can view their organization's umbrella ingredients"
  ON public.umbrella_ingredients
  FOR SELECT
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Policy for insert
DROP POLICY IF EXISTS "Users can insert their organization's umbrella ingredients" ON public.umbrella_ingredients;
CREATE POLICY "Users can insert their organization's umbrella ingredients"
  ON public.umbrella_ingredients
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Policy for update
DROP POLICY IF EXISTS "Users can update their organization's umbrella ingredients" ON public.umbrella_ingredients;
CREATE POLICY "Users can update their organization's umbrella ingredients"
  ON public.umbrella_ingredients
  FOR UPDATE
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Policy for delete
DROP POLICY IF EXISTS "Users can delete their organization's umbrella ingredients" ON public.umbrella_ingredients;
CREATE POLICY "Users can delete their organization's umbrella ingredients"
  ON public.umbrella_ingredients
  FOR DELETE
  USING (organization_id IN (
    SELECT org_id FROM user_organizations WHERE user_id = auth.uid()
  ));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE umbrella_ingredients;