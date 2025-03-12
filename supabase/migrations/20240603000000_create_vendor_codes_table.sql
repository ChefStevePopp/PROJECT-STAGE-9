-- Create a new table to store vendor codes for master ingredients
CREATE TABLE IF NOT EXISTS vendor_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  master_ingredient_id UUID NOT NULL REFERENCES master_ingredients(id),
  vendor_id TEXT NOT NULL,
  code TEXT NOT NULL,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (master_ingredient_id, vendor_id, code)
);

-- Add RLS policies
ALTER TABLE vendor_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to select vendor codes for their organization
CREATE POLICY "Users can view their organization's vendor codes"
  ON vendor_codes
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid()
  ));

-- Allow users to insert vendor codes for their organization
CREATE POLICY "Users can insert vendor codes for their organization"
  ON vendor_codes
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid()
  ));

-- Allow users to update vendor codes for their organization
CREATE POLICY "Users can update their organization's vendor codes"
  ON vendor_codes
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid()
  ));

-- Allow users to delete vendor codes for their organization
CREATE POLICY "Users can delete their organization's vendor codes"
  ON vendor_codes
  FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid()
  ));

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendor_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE TRIGGER update_vendor_codes_updated_at
BEFORE UPDATE ON vendor_codes
FOR EACH ROW
EXECUTE FUNCTION update_vendor_codes_updated_at();

-- Create a function to handle setting is_current flag
CREATE OR REPLACE FUNCTION handle_vendor_code_current_flag()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new record is marked as current, set all other codes for this ingredient/vendor to not current
  IF NEW.is_current = true THEN
    UPDATE vendor_codes
    SET is_current = false
    WHERE master_ingredient_id = NEW.master_ingredient_id
    AND vendor_id = NEW.vendor_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to handle setting is_current flag
CREATE TRIGGER handle_vendor_code_current_flag
AFTER INSERT OR UPDATE OF is_current ON vendor_codes
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION handle_vendor_code_current_flag();

-- Create a view to easily access current vendor codes
CREATE OR REPLACE VIEW current_vendor_codes AS
SELECT 
  vc.id,
  vc.organization_id,
  vc.master_ingredient_id,
  vc.vendor_id,
  vc.code,
  vc.created_at,
  vc.updated_at,
  mi.product as ingredient_name
FROM vendor_codes vc
JOIN master_ingredients mi ON vc.master_ingredient_id = mi.id
WHERE vc.is_current = true;

-- Add vendor_codes to master_ingredients_with_categories view
CREATE OR REPLACE VIEW master_ingredients_with_categories AS
SELECT 
  mi.*,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name,
  (SELECT json_build_object(
    'current', json_build_object(
      'code', vc.code,
      'vendor_id', vc.vendor_id
    ),
    'history', json_agg(json_build_object(
      'code', vh.code,
      'vendor_id', vh.vendor_id,
      'updated_at', vh.updated_at
    ))
  ) FROM vendor_codes vc
  LEFT JOIN vendor_codes vh ON mi.id = vh.master_ingredient_id AND vh.is_current = false
  WHERE mi.id = vc.master_ingredient_id AND vc.is_current = true
  GROUP BY vc.code, vc.vendor_id
  LIMIT 1) as vendor_codes
FROM master_ingredients mi
LEFT JOIN food_category_groups fcg ON mi.major_group = fcg.id
LEFT JOIN food_categories fc ON mi.category = fc.id
LEFT JOIN food_sub_categories fsc ON mi.sub_category = fsc.id;

-- Migrate existing item_code data to the new vendor_codes table
INSERT INTO vendor_codes (organization_id, master_ingredient_id, vendor_id, code, is_current)
SELECT 
  organization_id,
  id as master_ingredient_id,
  vendor as vendor_id,
  item_code as code,
  true as is_current
FROM master_ingredients
WHERE item_code IS NOT NULL AND item_code != '';
