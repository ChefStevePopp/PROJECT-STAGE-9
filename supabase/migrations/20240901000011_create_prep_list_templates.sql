-- Create prep_list_templates table
CREATE TABLE IF NOT EXISTS prep_list_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('opening', 'closing', 'prep', 'production', 'custom')),
  prep_system TEXT NOT NULL CHECK (prep_system IN ('par', 'as_needed', 'hybrid')),
  station TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  par_levels JSONB,
  schedule_days INTEGER[],
  advance_days INTEGER
);

-- Create prep_list_template_tasks table
CREATE TABLE IF NOT EXISTS prep_list_template_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES prep_list_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL,
  estimated_time INTEGER,
  station TEXT,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  prep_item_id UUID REFERENCES prepared_items(id) ON DELETE SET NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  par_level INTEGER,
  current_level INTEGER,
  schedule_days INTEGER[]
);

-- Create prep_lists table
CREATE TABLE IF NOT EXISTS prep_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prep_list_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  prep_system TEXT NOT NULL CHECK (prep_system IN ('par', 'as_needed', 'hybrid')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  inventory_snapshot JSONB,
  scheduled_for DATE
);

-- Add RLS policies
ALTER TABLE prep_list_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_list_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prep_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for prep_list_templates
CREATE POLICY "Users can view their organization's prep list templates"
  ON prep_list_templates
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create prep list templates for their organization"
  ON prep_list_templates
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update their organization's prep list templates"
  ON prep_list_templates
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their organization's prep list templates"
  ON prep_list_templates
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Create policies for prep_list_template_tasks
CREATE POLICY "Users can view their organization's prep list template tasks"
  ON prep_list_template_tasks
  FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM prep_list_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can create prep list template tasks for their organization"
  ON prep_list_template_tasks
  FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM prep_list_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can update their organization's prep list template tasks"
  ON prep_list_template_tasks
  FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM prep_list_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can delete their organization's prep list template tasks"
  ON prep_list_template_tasks
  FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM prep_list_templates WHERE organization_id IN (
        SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- Create policies for prep_lists
CREATE POLICY "Users can view their organization's prep lists"
  ON prep_lists
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can create prep lists for their organization"
  ON prep_lists
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update their organization's prep lists"
  ON prep_lists
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their organization's prep lists"
  ON prep_lists
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE prep_lists;
