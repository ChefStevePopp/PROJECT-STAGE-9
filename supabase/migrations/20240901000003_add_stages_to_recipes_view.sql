-- Drop the existing view
DROP VIEW IF EXISTS public.recipes_with_categories;

-- Recreate the view with stages and user names
CREATE VIEW public.recipes_with_categories AS
SELECT
  r.id,
  r.organization_id,
  r.type,
  r.status,
  r.name,
  r.description,
  r.major_group,
  r.category,
  r.sub_category,
  r.station,
  r.storage_area,
  r.container,
  r.container_type,
  r.shelf_life,
  r.prep_time,
  r.cook_time,
  r.rest_time,
  r.total_time,
  r.recipe_unit_ratio,
  r.unit_type,
  r.yield_amount,
  r.yield_unit,
  r.cost_per_unit,
  r.labor_cost_per_hour,
  r.total_cost,
  r.target_cost_percent,
  r.image_url,
  r.video_url,
  r.version,
  r.ingredients,
  r.steps,
  r.quality_standards,
  r."allergenInfo",
  r.media,
  r.training,
  r.versions,
  r.created_at,
  r.updated_at,
  r.created_by,
  r.modified_by,
  r.approved_by,
  r.approved_at,
  r.last_reviewed_at,
  r.last_reviewed_by,
  r.primary_station,
  r.secondary_stations,
  r.timeline_notes,
  r.equipment,
  r.prep_time_notes,
  r.prep_temp_notes,
  r.time_management_notes,
  r.label_requirements,
  r.use_label_printer,
  r.storage,
  r.secondary_station,
  r.production_notes,
  r.stages,
  fcg.name AS major_group_name,
  fc.name AS category_name,
  fsc.name AS sub_category_name,
  r.station AS station_name,
  creator.raw_user_meta_data->>'name' AS created_by_name,
  modifier.raw_user_meta_data->>'name' AS modified_by_name
FROM
  recipes r
  LEFT JOIN food_category_groups fcg ON fcg.id::text = r.major_group
    AND fcg.organization_id = r.organization_id
  LEFT JOIN food_categories fc ON fc.id::text = r.category
    AND fc.organization_id = r.organization_id
  LEFT JOIN food_sub_categories fsc ON fsc.id::text = r.sub_category
    AND fsc.organization_id = r.organization_id
  LEFT JOIN auth.users creator ON creator.id = r.created_by
  LEFT JOIN auth.users modifier ON modifier.id = r.modified_by;

-- Add RLS policy for the view
DROP POLICY IF EXISTS "Users can view recipes for their organization" ON recipes_with_categories;
CREATE POLICY "Users can view recipes for their organization"
  ON recipes_with_categories
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  ));
