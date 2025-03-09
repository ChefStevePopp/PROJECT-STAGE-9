-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  assignee_id UUID REFERENCES organization_team_members(id) ON DELETE SET NULL,
  station TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  estimated_time INTEGER NOT NULL DEFAULT 30,
  actual_time INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  notes TEXT,
  tags TEXT[]
);

-- Add RLS policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for organization members to view tasks
CREATE POLICY "Organization members can view tasks"
  ON tasks
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for organization members to insert tasks
CREATE POLICY "Organization members can insert tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for organization members to update their own tasks or tasks they created
CREATE POLICY "Organization members can update tasks"
  ON tasks
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for organization members to delete tasks they created
CREATE POLICY "Organization members can delete tasks"
  ON tasks
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Add activity_type enum value for task activities
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'task_created';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'task_updated';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'task_deleted';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'task_completed';
ALTER TYPE activity_type ADD VALUE IF NOT EXISTS 'task_assigned';
