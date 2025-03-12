-- Create umbrella_ingredients table
CREATE TABLE IF NOT EXISTS umbrella_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category UUID REFERENCES food_categories(id),
  sub_category UUID REFERENCES food_sub_categories(id),
  primary_master_ingredient_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create umbrella_ingredient_items table to link master ingredients to umbrella ingredients
CREATE TABLE IF NOT EXISTS umbrella_ingredient_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  umbrella_ingredient_id UUID NOT NULL REFERENCES umbrella_ingredients(id) ON DELETE CASCADE,
  master_ingredient_id UUID NOT NULL REFERENCES master_ingredients(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(umbrella_ingredient_id, master_ingredient_id)
);

-- Add RLS policies for umbrella_ingredients
ALTER TABLE umbrella_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view umbrella ingredients in their organization"
  ON umbrella_ingredients
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert umbrella ingredients in their organization"
  ON umbrella_ingredients
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update umbrella ingredients in their organization"
  ON umbrella_ingredients
  FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete umbrella ingredients in their organization"
  ON umbrella_ingredients
  FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
  ));

-- Add RLS policies for umbrella_ingredient_items
ALTER TABLE umbrella_ingredient_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view umbrella ingredient items in their organization"
  ON umbrella_ingredient_items
  FOR SELECT
  USING (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert umbrella ingredient items in their organization"
  ON umbrella_ingredient_items
  FOR INSERT
  WITH CHECK (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update umbrella ingredient items in their organization"
  ON umbrella_ingredient_items
  FOR UPDATE
  USING (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete umbrella ingredient items in their organization"
  ON umbrella_ingredient_items
  FOR DELETE
  USING (umbrella_ingredient_id IN (
    SELECT id FROM umbrella_ingredients WHERE organization_id IN (
      SELECT organization_id FROM organization_team_members WHERE id = auth.uid()
    )
  ));

-- Create a view to get umbrella ingredients with their linked master ingredients
CREATE OR REPLACE VIEW umbrella_ingredients_with_items AS
SELECT 
  ui.id,
  ui.organization_id,
  ui.name,
  ui.description,
  ui.category,
  ui.sub_category,
  ui.primary_master_ingredient_id,
  ui.created_at,
  ui.updated_at,
  COALESCE(
    (SELECT jsonb_agg(uii.master_ingredient_id) 
     FROM umbrella_ingredient_items uii 
     WHERE uii.umbrella_ingredient_id = ui.id),
    '[]'::jsonb
  ) as master_ingredients
FROM umbrella_ingredients ui;

-- Create a trigger to update the primary_master_ingredient_id when an item is marked as primary
CREATE OR REPLACE FUNCTION update_primary_master_ingredient()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary THEN
    -- Set all other items for this umbrella to not primary
    UPDATE umbrella_ingredient_items
    SET is_primary = FALSE
    WHERE umbrella_ingredient_id = NEW.umbrella_ingredient_id
    AND id != NEW.id;
    
    -- Update the primary_master_ingredient_id in the umbrella_ingredients table
    UPDATE umbrella_ingredients
    SET primary_master_ingredient_id = NEW.master_ingredient_id,
        updated_at = NOW()
    WHERE id = NEW.umbrella_ingredient_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_primary_master_ingredient_trigger
AFTER INSERT OR UPDATE ON umbrella_ingredient_items
FOR EACH ROW
WHEN (NEW.is_primary)
EXECUTE FUNCTION update_primary_master_ingredient();
