-- Add insert, update, and delete policies for operations_settings table

-- Create insert policy
CREATE POLICY "Users can insert operations_settings for their organization" 
ON operations_settings FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM organization_roles
  WHERE organization_roles.organization_id = operations_settings.organization_id
  AND organization_roles.user_id = auth.uid()
));

-- Create update policy
CREATE POLICY "Users can update operations_settings for their organization" 
ON operations_settings FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM organization_roles
  WHERE organization_roles.organization_id = operations_settings.organization_id
  AND organization_roles.user_id = auth.uid()
));

-- Create delete policy
CREATE POLICY "Users can delete operations_settings for their organization" 
ON operations_settings FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM organization_roles
  WHERE organization_roles.organization_id = operations_settings.organization_id
  AND organization_roles.user_id = auth.uid()
));
