-- Add use_label_printer column to recipes table
ALTER TABLE recipes
ADD COLUMN use_label_printer boolean DEFAULT false;

-- Add comment explaining the column's purpose
COMMENT ON COLUMN recipes.use_label_printer IS 'Boolean flag indicating if this recipe should use the label printer feature (medium tier feature)';
