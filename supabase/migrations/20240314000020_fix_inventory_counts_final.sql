-- Drop and recreate inventory_counts table with proper constraints
DROP TABLE IF EXISTS inventory_counts CASCADE;

CREATE TABLE inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  master_ingredient_id UUID NOT NULL,
  count_date DATE NOT NULL DEFAULT CURRENT_DATE,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  location TEXT,
  counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'verified')) DEFAULT 'pending',
  FOREIGN KEY (master_ingredient_id, organization_id) 
    REFERENCES master_ingredients(id, organization_id) 
    ON DELETE CASCADE,
  UNIQUE(organization_id, master_ingredient_id, count_date)
);

-- Enable RLS
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies
CREATE POLICY "View inventory counts"
  ON inventory_counts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage inventory counts"
  ON inventory_counts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'system_role' = 'dev'
        OR raw_user_meta_data->>'role' = 'dev'
        OR raw_user_meta_data->>'organizationId' = inventory_counts.organization_id::text
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_inventory_counts_org_id ON inventory_counts(organization_id);
CREATE INDEX idx_inventory_counts_ingredient_id ON inventory_counts(master_ingredient_id);
CREATE INDEX idx_inventory_counts_date ON inventory_counts(count_date);
CREATE INDEX idx_inventory_counts_status ON inventory_counts(status);

-- Create trigger for updated_at
CREATE TRIGGER update_inventory_counts_updated_at
  BEFORE UPDATE ON inventory_counts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE inventory_counts IS 'Stores inventory count history linked to master ingredients';
COMMENT ON COLUMN inventory_counts.quantity IS 'Quantity counted in ingredient''s unit of measure';
COMMENT ON COLUMN inventory_counts.unit_cost IS 'Cost per unit at time of count';
COMMENT ON COLUMN inventory_counts.total_value IS 'Calculated total value of counted inventory';

-- Create view for inventory counts with ingredient details
CREATE OR REPLACE VIEW inventory_counts_with_ingredients AS
SELECT 
  ic.*,
  mi.item_code,
  mi.product,
  mi.unit_of_measure,
  mi.image_url,
  fcg.name as major_group_name,
  fc.name as category_name,
  fsc.name as sub_category_name
FROM inventory_counts ic
JOIN master_ingredients mi ON mi.id = ic.master_ingredient_id 
  AND mi.organization_id = ic.organization_id
LEFT JOIN food_category_groups fcg ON fcg.id = mi.major_group 
  AND fcg.organization_id = mi.organization_id
LEFT JOIN food_categories fc ON fc.id = mi.category 
  AND fc.organization_id = mi.organization_id
LEFT JOIN food_sub_categories fsc ON fsc.id = mi.sub_category 
  AND fsc.organization_id = mi.organization_id;

-- Grant appropriate permissions
GRANT SELECT ON inventory_counts_with_ingredients TO authenticated;
GRANT ALL ON inventory_counts TO authenticated;

-- Add helpful comment
COMMENT ON VIEW inventory_counts_with_ingredients IS 
'View that includes ingredient details and category names for inventory counts';