-- Fix RLS policy for vendor_price_changes table
ALTER TABLE vendor_price_changes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own vendor_price_changes" ON vendor_price_changes;
DROP POLICY IF EXISTS "Users can view their organization's vendor_price_changes" ON vendor_price_changes;
DROP POLICY IF EXISTS "Users can update their organization's vendor_price_changes" ON vendor_price_changes;

-- Create new policies
CREATE POLICY "Users can insert their own vendor_price_changes"
ON vendor_price_changes
FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_roles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can view their organization's vendor_price_changes"
ON vendor_price_changes
FOR SELECT
USING (organization_id IN (
  SELECT organization_id FROM organization_roles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their organization's vendor_price_changes"
ON vendor_price_changes
FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM organization_roles 
  WHERE user_id = auth.uid()
))
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_roles 
  WHERE user_id = auth.uid()
));
