-- Drop the existing view
DROP VIEW IF EXISTS recipes_with_categories;

-- Recreate the view with the created_by_email column
CREATE VIEW recipes_with_categories AS
SELECT 
  r.*,
  -- Get category names
  fc.name AS category_name,
  fsc.name AS sub_category_name,
  fmg.name AS major_group_name,
  s.name AS station_name,
  -- Get user names
  (
    SELECT tm.name 
    FROM organization_team_members tm 
    WHERE tm.user_id::uuid = r.created_by::uuid
    UNION ALL
    SELECT o.name 
    FROM organizations o 
    WHERE o.owner_id::uuid = r.created_by::uuid
    LIMIT 1
  ) AS created_by_name,
  (
    SELECT tm.name 
    FROM organization_team_members tm 
    WHERE tm.user_id::uuid = r.modified_by::uuid
    UNION ALL
    SELECT o.name 
    FROM organizations o 
    WHERE o.owner_id::uuid = r.modified_by::uuid
    LIMIT 1
  ) AS modified_by_name,
  -- Add created_by_email
  (
    SELECT tm.email 
    FROM organization_team_members tm 
    WHERE tm.user_id::uuid = r.created_by::uuid
    UNION ALL
    SELECT au.email 
    FROM auth.users au 
    WHERE au.id::uuid = r.created_by::uuid
    LIMIT 1
  ) AS created_by_email,
  -- Add modified_by_email
  (
    SELECT tm.email 
    FROM organization_team_members tm 
    WHERE tm.user_id::uuid = r.modified_by::uuid
    UNION ALL
    SELECT au.email 
    FROM auth.users au 
    WHERE au.id::uuid = r.modified_by::uuid
    LIMIT 1
  ) AS modified_by_email
FROM 
  recipes r
LEFT JOIN 
  food_categories fc ON r.category::uuid = fc.id::uuid
LEFT JOIN 
  food_categories fsc ON r.sub_category::uuid = fsc.id::uuid
LEFT JOIN 
  food_categories fmg ON r.major_group::uuid = fmg.id::uuid
LEFT JOIN 
  kitchen_stations s ON r.station::uuid = s.id::uuid;

-- Enable row-level security
ALTER VIEW recipes_with_categories OWNER TO postgres;

-- Add the view to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE recipes_with_categories;