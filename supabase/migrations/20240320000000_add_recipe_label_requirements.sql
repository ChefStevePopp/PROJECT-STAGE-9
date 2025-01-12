-- Add label requirements to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS label_requirements jsonb DEFAULT jsonb_build_object(
  'required_fields', jsonb_build_array(),
  'custom_fields', jsonb_build_array(),
  'description', '',
  'example_photo_url', null,
  'example_photo_description', null,
  'use_label_printer', false
);