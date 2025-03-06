-- Create a view that maps UUIDs to text names for food relationships
CREATE OR REPLACE VIEW public.food_relationships_mapping AS
SELECT 
  mi.id,
  mi.organization_id,
  mi.major_group,
  mi.category,
  mi.sub_category,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name
FROM 
  public.master_ingredients mi
LEFT JOIN 
  public.food_category_groups fcg ON mi.major_group = fcg.id
LEFT JOIN 
  public.food_categories fc ON mi.category = fc.id
LEFT JOIN 
  public.food_sub_categories fsc ON mi.sub_category = fsc.id;

-- Add RLS policy for the view
ALTER VIEW public.food_relationships_mapping OWNER TO postgres;
GRANT SELECT ON public.food_relationships_mapping TO anon, authenticated, service_role;

-- Update the master_ingredients_with_categories view to include the mapped names
CREATE OR REPLACE VIEW public.master_ingredients_with_categories AS
SELECT 
  mi.*,
  frm.major_group_name,
  frm.category_name,
  frm.sub_category_name
FROM 
  public.master_ingredients mi
LEFT JOIN 
  public.food_relationships_mapping frm ON mi.id = frm.id;
