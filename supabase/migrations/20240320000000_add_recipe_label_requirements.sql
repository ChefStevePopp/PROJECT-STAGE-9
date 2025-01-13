-- Add label requirements columns to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS label_requirements jsonb DEFAULT jsonb_build_object(
  'required_fields', jsonb_build_array(),
  'custom_fields', jsonb_build_array(),
  'description', '',
  'example_photo_url', null,
  'example_photo_description', null,
  'use_label_printer', false
);

-- Add comment to explain the structure
COMMENT ON COLUMN recipes.label_requirements IS 'JSON structure containing:
- required_fields: array of required label fields
- custom_fields: array of custom label fields
- description: text description of labeling requirements
- example_photo_url: URL to example label photo
- example_photo_description: description of example photo
- use_label_printer: boolean indicating if recipe should use label printer';
