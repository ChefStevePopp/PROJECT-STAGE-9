-- Drop the existing view first
DROP VIEW IF EXISTS recipes_with_categories;

-- Recreate the view with all the needed columns but without the problematic joins
CREATE OR REPLACE VIEW recipes_with_categories WITH (SECURITY_INVOKER=true) AS
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
  r.stages,
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
  fcg.name AS major_group_name,
  fc.name AS category_name,
  fsc.name AS sub_category_name,
  r.station AS station_name,
  '' AS created_by_name,
  '' AS modified_by_name,
  '' AS created_by_email,
  '' AS modified_by_email
FROM 
  recipes r
LEFT JOIN 
  food_category_groups fcg ON fcg.id::text = r.major_group AND fcg.organization_id = r.organization_id
LEFT JOIN 
  food_categories fc ON fc.id::text = r.category AND fc.organization_id = r.organization_id
LEFT JOIN 
  food_sub_categories fsc ON fsc.id::text = r.sub_category AND fsc.organization_id = r.organization_id;

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE recipes_with_categories;