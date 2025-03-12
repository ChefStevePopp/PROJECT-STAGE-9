-- Add note column to vendor_codes table
ALTER TABLE vendor_codes ADD COLUMN IF NOT EXISTS note TEXT;

-- Drop the existing view first
DROP VIEW IF EXISTS current_vendor_codes;

-- Recreate the current_vendor_codes view to include both variation_label and note columns
CREATE VIEW current_vendor_codes AS
SELECT 
  vc.id,
  vc.master_ingredient_id,
  vc.organization_id,
  vc.vendor_id,
  vc.code,
  vc.variation_label,
  vc.note,
  vc.is_current,
  vc.created_at,
  vc.updated_at,
  mi.product as ingredient_name
FROM vendor_codes vc
JOIN master_ingredients mi ON vc.master_ingredient_id = mi.id;
