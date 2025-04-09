-- Change priority column type from integer to text
ALTER TABLE prep_list_template_tasks ALTER COLUMN priority TYPE TEXT USING priority::TEXT;
