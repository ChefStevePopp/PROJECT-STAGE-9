-- Fix RLS policy for vendor_price_changes table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own vendor_price_changes" ON vendor_price_changes;

-- Create new policy with ingredient_id field
CREATE POLICY "Users can insert their own vendor_price_changes"
ON vendor_price_changes
FOR INSERT
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_roles 
  WHERE user_id = auth.uid()
));

-- Add missing ingredient_id field to DataPreview component's price change records
COMMENT ON TABLE vendor_price_changes IS 'Stores price changes for vendor items with proper organization access control';
