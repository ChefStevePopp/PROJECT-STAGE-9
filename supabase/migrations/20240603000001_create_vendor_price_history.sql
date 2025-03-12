-- Create a table to store vendor price history
CREATE TABLE IF NOT EXISTS vendor_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  master_ingredient_id UUID NOT NULL REFERENCES master_ingredients(id),
  vendor_id TEXT NOT NULL,
  vendor_code_id UUID REFERENCES vendor_codes(id),
  price DECIMAL(10, 2) NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invoice_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Add RLS policies
ALTER TABLE vendor_price_history ENABLE ROW LEVEL SECURITY;

-- Allow users to select price history for their organization
CREATE POLICY "Users can view their organization's price history"
  ON vendor_price_history
  FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid()
  ));

-- Allow users to insert price history for their organization
CREATE POLICY "Users can insert price history for their organization"
  ON vendor_price_history
  FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_roles 
    WHERE user_id = auth.uid()
  ));

-- Create a view to analyze price trends
CREATE OR REPLACE VIEW vendor_price_trends AS
SELECT
  vph.master_ingredient_id,
  mi.product as ingredient_name,
  vph.vendor_id,
  vph.price,
  vph.effective_date,
  vph.organization_id,
  LAG(vph.price) OVER (PARTITION BY vph.master_ingredient_id, vph.vendor_id ORDER BY vph.effective_date) as previous_price,
  CASE 
    WHEN LAG(vph.price) OVER (PARTITION BY vph.master_ingredient_id, vph.vendor_id ORDER BY vph.effective_date) IS NOT NULL 
    THEN ((vph.price - LAG(vph.price) OVER (PARTITION BY vph.master_ingredient_id, vph.vendor_id ORDER BY vph.effective_date)) / 
          LAG(vph.price) OVER (PARTITION BY vph.master_ingredient_id, vph.vendor_id ORDER BY vph.effective_date)) * 100
    ELSE 0
  END as price_change_percent
FROM vendor_price_history vph
JOIN master_ingredients mi ON vph.master_ingredient_id = mi.id
ORDER BY vph.master_ingredient_id, vph.vendor_id, vph.effective_date DESC;

-- Create a function to update master_ingredients current_price when a new price is added
CREATE OR REPLACE FUNCTION update_master_ingredient_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the master_ingredients current_price with the latest price
  UPDATE master_ingredients
  SET current_price = NEW.price,
      updated_at = now()
  WHERE id = NEW.master_ingredient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update master_ingredients current_price
CREATE TRIGGER update_master_ingredient_price
AFTER INSERT ON vendor_price_history
FOR EACH ROW
EXECUTE FUNCTION update_master_ingredient_price();

-- Migrate existing price data to the new vendor_price_history table
INSERT INTO vendor_price_history (
  organization_id,
  master_ingredient_id,
  vendor_id,
  vendor_code_id,
  price,
  effective_date,
  notes
)
SELECT 
  mi.organization_id,
  mi.id as master_ingredient_id,
  mi.vendor as vendor_id,
  vc.id as vendor_code_id,
  mi.current_price as price,
  mi.updated_at as effective_date,
  'Initial price migration' as notes
FROM master_ingredients mi
LEFT JOIN vendor_codes vc ON mi.id = vc.master_ingredient_id AND vc.is_current = true
WHERE mi.current_price > 0;
