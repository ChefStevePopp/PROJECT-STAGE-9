-- Add total_time to recipe stages without using triggers
-- This migration adds a total_time field to each stage object in the recipes.stages JSONB array

-- Create a function that doesn't disable triggers
CREATE OR REPLACE FUNCTION add_total_time_to_stages()
RETURNS void AS $$
DECLARE
  r RECORD;
  updated_stages JSONB;
BEGIN
  FOR r IN SELECT id, stages FROM recipes WHERE stages IS NOT NULL LOOP
    -- Process the stages array without modifying it directly
    SELECT jsonb_agg(
      CASE
        WHEN stage->>'total_time' IS NULL THEN stage || '{"total_time": 0}'
        ELSE stage
      END
    ) INTO updated_stages
    FROM jsonb_array_elements(r.stages) AS stage;
    
    -- Only update if we have valid stages
    IF updated_stages IS NOT NULL THEN
      UPDATE recipes
      SET stages = updated_stages
      WHERE id = r.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT add_total_time_to_stages();

-- Drop the function after use
DROP FUNCTION add_total_time_to_stages();

-- Add the new column to the realtime publication
alter publication supabase_realtime add table recipes;