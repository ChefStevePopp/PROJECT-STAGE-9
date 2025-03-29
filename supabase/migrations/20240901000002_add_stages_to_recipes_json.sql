-- Add stages column to recipes table if it doesn't exist already
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recipes' AND column_name = 'stages') THEN
    ALTER TABLE recipes ADD COLUMN stages JSONB DEFAULT NULL;
  END IF;
END $$;

-- Enable RLS for recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policy for recipes table
DROP POLICY IF EXISTS "Users can view their organization's recipes" ON recipes;
CREATE POLICY "Users can view their organization's recipes"
  ON recipes
  FOR SELECT
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their organization's recipes" ON recipes;
CREATE POLICY "Users can insert their organization's recipes"
  ON recipes
  FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their organization's recipes" ON recipes;
CREATE POLICY "Users can update their organization's recipes"
  ON recipes
  FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Add realtime publication for recipes table
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
