-- Add organization_id column to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Update existing tasks with organization_id from their template
UPDATE prep_list_template_tasks
SET organization_id = prep_list_templates.organization_id
FROM prep_list_templates
WHERE prep_list_template_tasks.template_id = prep_list_templates.id;

-- Add index for performance
CREATE INDEX IF NOT EXISTS prep_list_template_tasks_organization_id_idx ON prep_list_template_tasks(organization_id);

-- Table is already in the realtime publication, no need to add it again
