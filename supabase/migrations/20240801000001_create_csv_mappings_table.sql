-- Create CSV mappings table for storing configuration data
CREATE TABLE IF NOT EXISTS csv_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT NOT NULL,
  format_type TEXT,
  employee_name_field TEXT,
  role_field TEXT,
  date_field TEXT,
  start_time_field TEXT,
  end_time_field TEXT,
  break_duration_field TEXT,
  notes_field TEXT,
  monday_field TEXT,
  tuesday_field TEXT,
  wednesday_field TEXT,
  thursday_field TEXT,
  friday_field TEXT,
  saturday_field TEXT,
  sunday_field TEXT,
  time_format TEXT,
  role_pattern TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(organization_id, format, name)
);

-- Add RLS policies
ALTER TABLE csv_mappings ENABLE ROW LEVEL SECURITY;

-- Allow users to select their organization's mappings
CREATE POLICY "Users can view their organization's CSV mappings"
ON csv_mappings FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  )
);

-- Allow users to insert mappings for their organization
CREATE POLICY "Users can insert CSV mappings for their organization"
ON csv_mappings FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  )
);

-- Allow users to update mappings for their organization
CREATE POLICY "Users can update their organization's CSV mappings"
ON csv_mappings FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete mappings for their organization
CREATE POLICY "Users can delete their organization's CSV mappings"
ON csv_mappings FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_roles
    WHERE user_id = auth.uid()
  )
);

-- Enable realtime
alter publication supabase_realtime add table csv_mappings;
