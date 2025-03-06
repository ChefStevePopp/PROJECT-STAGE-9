-- Create a view for inventory counts with ingredient information
CREATE OR REPLACE VIEW public.inventory_counts_with_ingredients AS
SELECT 
  ic.id,
  ic.organization_id,
  ic.ingredient_id,
  ic.count_date,
  ic.quantity,
  ic.previous_quantity,
  ic.expected_quantity,
  ic.unit_type,
  ic.location,
  ic.counted_by,
  ic.notes,
  ic.status,
  ic.created_at,
  ic.updated_at,
  mi.product,
  mi.major_group,
  mi.category,
  mi.sub_category,
  mi.cost_per_recipe_unit,
  mi.vendor,
  mi.storage_area,
  mi.recipe_unit_type,
  mi.current_price,
  mi.major_group_name,
  mi.category_name,
  mi.sub_category_name
FROM 
  public.inventory_counts ic
LEFT JOIN 
  public.master_ingredients_with_categories mi ON ic.ingredient_id = mi.id;

-- Add RLS policy for the view
ALTER VIEW public.inventory_counts_with_ingredients OWNER TO postgres;
GRANT SELECT ON public.inventory_counts_with_ingredients TO anon, authenticated, service_role;

-- Create RLS policy for inventory_counts table if it doesn't exist
CREATE POLICY "Users can view their organization's inventory counts"
  ON public.inventory_counts
  FOR SELECT
  TO authenticated
  USING (organization_id = auth.jwt() ->> 'organization_id'::text);

CREATE POLICY "Users can insert their organization's inventory counts"
  ON public.inventory_counts
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = auth.jwt() ->> 'organization_id'::text);

CREATE POLICY "Users can update their organization's inventory counts"
  ON public.inventory_counts
  FOR UPDATE
  TO authenticated
  USING (organization_id = auth.jwt() ->> 'organization_id'::text);
