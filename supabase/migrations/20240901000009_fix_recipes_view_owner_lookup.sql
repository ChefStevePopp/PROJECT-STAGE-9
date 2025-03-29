-- Drop the existing view
DROP VIEW IF EXISTS recipes_with_categories;

-- Recreate the view with the updated subqueries that check both organization_team_members and organizations tables
CREATE OR REPLACE VIEW recipes_with_categories AS
SELECT 
  r.*,
  fc.name AS category_name,
  fc.display_name AS category_display_name,
  fsc.name AS sub_category_name,
  fsc.display_name AS sub_category_display_name,
  s.name AS station_name,
  s.display_name AS station_display_name,
  (
    SELECT first_name || ' ' || last_name 
    FROM (
      SELECT first_name, last_name FROM organization_team_members WHERE id = r.created_by AND organization_id = r.organization_id
      UNION ALL
      SELECT first_name, last_name FROM organizations WHERE id = r.organization_id AND owner_id = r.created_by
    ) AS creators
    LIMIT 1
  ) AS created_by_name,
  (
    SELECT first_name || ' ' || last_name 
    FROM (
      SELECT first_name, last_name FROM organization_team_members WHERE id = r.modified_by AND organization_id = r.organization_id
      UNION ALL
      SELECT first_name, last_name FROM organizations WHERE id = r.organization_id AND owner_id = r.modified_by
    ) AS modifiers
    LIMIT 1
  ) AS modified_by_name,
  (
    SELECT email 
    FROM (
      SELECT email FROM organization_team_members WHERE id = r.created_by AND organization_id = r.organization_id
      UNION ALL
      SELECT email FROM organizations WHERE id = r.organization_id AND owner_id = r.created_by
    ) AS creator_emails
    LIMIT 1
  ) AS created_by_email,
  (
    SELECT email 
    FROM (
      SELECT email FROM organization_team_members WHERE id = r.modified_by AND organization_id = r.organization_id
      UNION ALL
      SELECT email FROM organizations WHERE id = r.organization_id AND owner_id = r.modified_by
    ) AS modifier_emails
    LIMIT 1
  ) AS modified_by_email
FROM recipes r
LEFT JOIN food_categories fc ON r.category = fc.id AND r.organization_id = fc.organization_id
LEFT JOIN food_sub_categories fsc ON r.sub_category = fsc.id AND r.organization_id = fsc.organization_id
LEFT JOIN stations s ON r.station = s.id AND r.organization_id = s.organization_id;

-- Enable row-level security
ALTER VIEW recipes_with_categories OWNER TO postgres;

-- Add RLS policy
DROP POLICY IF EXISTS "Users can view their organization's recipes" ON recipes_with_categories;
CREATE POLICY "Users can view their organization's recipes"
  ON recipes_with_categories
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
