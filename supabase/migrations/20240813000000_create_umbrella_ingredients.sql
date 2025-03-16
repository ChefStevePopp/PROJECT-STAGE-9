-- Create the umbrella_ingredients table
CREATE TABLE IF NOT EXISTS public.umbrella_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  organization_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NULL,
  major_group UUID NULL,
  category UUID NULL,
  sub_category UUID NULL,
  storage_area TEXT NULL,
  primary_master_ingredient_id UUID NULL,
  allergen_peanut BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_crustacean BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_treenut BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_shellfish BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_sesame BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_soy BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_fish BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_wheat BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_milk BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_sulphite BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_egg BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_gluten BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_mustard BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_celery BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_garlic BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_onion BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_nitrite BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_mushroom BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_hot_pepper BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_citrus BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_pork BOOLEAN NOT NULL DEFAULT FALSE,
  allergen_custom1_name TEXT NULL,
  allergen_custom1_active BOOLEAN NULL DEFAULT FALSE,
  allergen_custom2_name TEXT NULL,
  allergen_custom2_active BOOLEAN NULL DEFAULT FALSE,
  allergen_custom3_name TEXT NULL,
  allergen_custom3_active BOOLEAN NULL DEFAULT FALSE,
  allergen_notes TEXT NULL,
  CONSTRAINT umbrella_ingredients_pkey PRIMARY KEY (id),
  CONSTRAINT umbrella_ingredients_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT umbrella_ingredients_category_fkey FOREIGN KEY (category) REFERENCES food_categories (id) ON DELETE SET NULL,
  CONSTRAINT umbrella_ingredients_major_group_fkey FOREIGN KEY (major_group) REFERENCES food_category_groups (id) ON DELETE SET NULL,
  CONSTRAINT umbrella_ingredients_sub_category_fkey FOREIGN KEY (sub_category) REFERENCES food_sub_categories (id) ON DELETE SET NULL,
  CONSTRAINT umbrella_ingredients_primary_master_ingredient_id_fkey FOREIGN KEY (primary_master_ingredient_id) REFERENCES master_ingredients (id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_umbrella_ingredients_organization_id ON public.umbrella_ingredients USING btree (organization_id);
CREATE INDEX IF NOT EXISTS idx_umbrella_ingredients_major_group ON public.umbrella_ingredients USING btree (major_group);
CREATE INDEX IF NOT EXISTS idx_umbrella_ingredients_category ON public.umbrella_ingredients USING btree (category);
CREATE INDEX IF NOT EXISTS idx_umbrella_ingredients_sub_category ON public.umbrella_ingredients USING btree (sub_category);
CREATE INDEX IF NOT EXISTS idx_umbrella_ingredients_primary_master_ingredient_id ON public.umbrella_ingredients USING btree (primary_master_ingredient_id);

-- Create the umbrella_ingredient_master_ingredients table
CREATE TABLE IF NOT EXISTS public.umbrella_ingredient_master_ingredients (
  umbrella_ingredient_id UUID NOT NULL,
  master_ingredient_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT umbrella_ingredient_master_ingredients_pkey PRIMARY KEY (umbrella_ingredient_id, master_ingredient_id),
  CONSTRAINT umbrella_ingredient_master_ingredie_umbrella_ingredient_id_fkey FOREIGN KEY (umbrella_ingredient_id) REFERENCES umbrella_ingredients (id) ON DELETE CASCADE,
  CONSTRAINT umbrella_ingredient_master_ingredient_master_ingredient_id_fkey FOREIGN KEY (master_ingredient_id) REFERENCES master_ingredients (id) ON DELETE CASCADE
);

-- Create the umbrella_ingredients_with_details view
CREATE OR REPLACE VIEW public.umbrella_ingredients_with_details AS
SELECT
  ui.id,
  ui.created_at,
  ui.updated_at,
  ui.organization_id,
  ui.name,
  ui.description,
  ui.major_group,
  ui.category,
  ui.sub_category,
  ui.storage_area,
  ui.primary_master_ingredient_id,
  ui.allergen_peanut,
  ui.allergen_crustacean,
  ui.allergen_treenut,
  ui.allergen_shellfish,
  ui.allergen_sesame,
  ui.allergen_soy,
  ui.allergen_fish,
  ui.allergen_wheat,
  ui.allergen_milk,
  ui.allergen_sulphite,
  ui.allergen_egg,
  ui.allergen_gluten,
  ui.allergen_mustard,
  ui.allergen_celery,
  ui.allergen_garlic,
  ui.allergen_onion,
  ui.allergen_nitrite,
  ui.allergen_mushroom,
  ui.allergen_hot_pepper,
  ui.allergen_citrus,
  ui.allergen_pork,
  ui.allergen_custom1_name,
  ui.allergen_custom1_active,
  ui.allergen_custom2_name,
  ui.allergen_custom2_active,
  ui.allergen_custom3_name,
  ui.allergen_custom3_active,
  ui.allergen_notes,
  fcg.name AS major_group_name,
  fc.name AS category_name,
  fsc.name AS sub_category_name,
  mi.recipe_unit_type,
  mi.cost_per_recipe_unit,
  ARRAY_AGG(uimi.master_ingredient_id) FILTER (WHERE uimi.master_ingredient_id IS NOT NULL) as master_ingredients
FROM
  umbrella_ingredients ui
  LEFT JOIN food_category_groups fcg ON ui.major_group = fcg.id
  LEFT JOIN food_categories fc ON ui.category = fc.id
  LEFT JOIN food_sub_categories fsc ON ui.sub_category = fsc.id
  LEFT JOIN master_ingredients mi ON ui.primary_master_ingredient_id = mi.id
  LEFT JOIN umbrella_ingredient_master_ingredients uimi ON ui.id = uimi.umbrella_ingredient_id
GROUP BY
  ui.id,
  fcg.name,
  fc.name,
  fsc.name,
  mi.recipe_unit_type,
  mi.cost_per_recipe_unit;

-- Enable Row Level Security
ALTER TABLE public.umbrella_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.umbrella_ingredient_master_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for umbrella_ingredients
CREATE POLICY "Users can view umbrella ingredients" ON public.umbrella_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Users can insert umbrella ingredients" ON public.umbrella_ingredients
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT user_id FROM organization_roles WHERE organization_id = umbrella_ingredients.organization_id
  ));

CREATE POLICY "Users can update umbrella ingredients" ON public.umbrella_ingredients
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM organization_roles WHERE organization_id = umbrella_ingredients.organization_id
  ));

CREATE POLICY "Users can delete umbrella ingredients" ON public.umbrella_ingredients
  FOR DELETE USING (auth.uid() IN (
    SELECT user_id FROM organization_roles WHERE organization_id = umbrella_ingredients.organization_id
  ));

-- Create policies for umbrella_ingredient_master_ingredients
CREATE POLICY "Users can view umbrella ingredient relationships" ON public.umbrella_ingredient_master_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Users can insert umbrella ingredient relationships" ON public.umbrella_ingredient_master_ingredients
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM umbrella_ingredients ui
    JOIN organization_roles ur ON ui.organization_id = ur.organization_id
    WHERE ui.id = umbrella_ingredient_master_ingredients.umbrella_ingredient_id
    AND ur.user_id = auth.uid()
  ));

CREATE POLICY "Users can update umbrella ingredient relationships" ON public.umbrella_ingredient_master_ingredients
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM umbrella_ingredients ui
    JOIN organization_roles ur ON ui.organization_id = ur.organization_id
    WHERE ui.id = umbrella_ingredient_master_ingredients.umbrella_ingredient_id
    AND ur.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete umbrella ingredient relationships" ON public.umbrella_ingredient_master_ingredients
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM umbrella_ingredients ui
    JOIN organization_roles ur ON ui.organization_id = ur.organization_id
    WHERE ui.id = umbrella_ingredient_master_ingredients.umbrella_ingredient_id
    AND ur.user_id = auth.uid()
  ));

-- Add to realtime publication
alter publication supabase_realtime add table umbrella_ingredients;
alter publication supabase_realtime add table umbrella_ingredient_master_ingredients;