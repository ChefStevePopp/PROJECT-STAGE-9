-- Update existing tasks with organization_id from their template
UPDATE prep_list_template_tasks
SET organization_id = prep_list_templates.organization_id
FROM prep_list_templates
WHERE prep_list_template_tasks.template_id = prep_list_templates.id
AND prep_list_template_tasks.organization_id IS NULL;
