-- Add storage column to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS storage jsonb;

-- Add comment explaining the storage column structure
COMMENT ON COLUMN recipes.storage IS 'Stores recipe storage information including:
- primary_area: string
- secondary_area: string
- primary_image_url: string
- secondary_image_url: string
- container: string
- container_type: string
- shelf_life_days: number
- shelf_life_type: string
- thawing_required: boolean
- thawing_instructions: string
- storage_temp: number
- storage_temp_unit: string
- temp_range: number
- temp_range_unit: string
- is_critical_control_point: boolean';

-- Update RLS policy to include storage column
DROP POLICY IF EXISTS recipes_select_policy ON recipes;
CREATE POLICY recipes_select_policy ON recipes
    FOR SELECT
    USING (organization_id = auth.jwt() ->> 'organization_id');
