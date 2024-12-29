-- Add health inspection related fields to organization settings
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS health_inspections JSONB DEFAULT jsonb_build_object(
  'certificate', jsonb_build_object(
    'number', null,
    'expiry_date', null,
    'image_url', null,
    'last_updated', null
  ),
  'visits', jsonb_build_array(),
  'notifications', jsonb_build_array()
);

-- Create health_inspections table for better structure
CREATE TABLE health_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  inspector_name TEXT,
  notes TEXT,
  documents JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  UNIQUE(organization_id, visit_date)
);

-- Enable RLS
ALTER TABLE health_inspections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View health inspections"
  ON health_inspections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = health_inspections.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage health inspections"
  ON health_inspections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = health_inspections.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND system_role = 'dev'
    )
  );

-- Create notifications table for health inspection alerts
CREATE TABLE health_inspection_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES health_inspections(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('action_item', 'deadline', 'visit', 'certificate')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('critical', 'major', 'minor')),
  deadline DATE,
  read_by JSONB DEFAULT '[]',
  UNIQUE(organization_id, inspection_id, type)
);

-- Enable RLS
ALTER TABLE health_inspection_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View health inspection notifications"
  ON health_inspection_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = health_inspection_notifications.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage health inspection notifications"
  ON health_inspection_notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = health_inspection_notifications.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND system_role = 'dev'
    )
  );

-- Create function to handle notification creation
CREATE OR REPLACE FUNCTION create_health_inspection_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for new action items
  IF (NEW.action_items IS DISTINCT FROM OLD.action_items) THEN
    INSERT INTO health_inspection_notifications (
      organization_id,
      inspection_id,
      type,
      title,
      message,
      severity,
      deadline
    )
    SELECT
      NEW.organization_id,
      NEW.id,
      'action_item',
      'New Health Inspection Action Item',
      item->>'description',
      item->>'severity',
      (item->>'deadline')::date
    FROM jsonb_array_elements(NEW.action_items) AS item
    WHERE item->>'id' NOT IN (
      SELECT jsonb_array_elements(OLD.action_items)->>'id'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER health_inspection_notification_trigger
  AFTER UPDATE ON health_inspections
  FOR EACH ROW
  EXECUTE FUNCTION create_health_inspection_notification();