-- Add vendor_code_id to vendor_invoice_items table
ALTER TABLE vendor_invoice_items
ADD COLUMN IF NOT EXISTS vendor_code_id UUID REFERENCES vendor_codes(id);

-- Create a function to link vendor_invoice_items to vendor_codes
CREATE OR REPLACE FUNCTION link_invoice_item_to_vendor_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to find a matching vendor code
  SELECT id INTO NEW.vendor_code_id
  FROM vendor_codes
  WHERE master_ingredient_id = NEW.master_ingredient_id
  AND vendor_id = (SELECT vendor_id FROM vendor_invoices WHERE id = NEW.invoice_id)
  AND code = NEW.vendor_code
  AND is_current = true
  LIMIT 1;
  
  -- If no matching vendor code found, create one
  IF NEW.vendor_code_id IS NULL AND NEW.vendor_code IS NOT NULL THEN
    INSERT INTO vendor_codes (
      organization_id,
      master_ingredient_id,
      vendor_id,
      code,
      is_current
    ) VALUES (
      (SELECT organization_id FROM vendor_invoices WHERE id = NEW.invoice_id),
      NEW.master_ingredient_id,
      (SELECT vendor_id FROM vendor_invoices WHERE id = NEW.invoice_id),
      NEW.vendor_code,
      true
    )
    RETURNING id INTO NEW.vendor_code_id;
  END IF;
  
  -- Record the price in vendor_price_history
  INSERT INTO vendor_price_history (
    organization_id,
    master_ingredient_id,
    vendor_id,
    vendor_code_id,
    price,
    effective_date,
    invoice_id,
    notes
  ) VALUES (
    (SELECT organization_id FROM vendor_invoices WHERE id = NEW.invoice_id),
    NEW.master_ingredient_id,
    (SELECT vendor_id FROM vendor_invoices WHERE id = NEW.invoice_id),
    NEW.vendor_code_id,
    NEW.unit_price,
    (SELECT invoice_date FROM vendor_invoices WHERE id = NEW.invoice_id),
    NEW.invoice_id,
    'Recorded from invoice item'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to link invoice items to vendor codes
CREATE TRIGGER link_invoice_item_to_vendor_code
BEFORE INSERT ON vendor_invoice_items
FOR EACH ROW
EXECUTE FUNCTION link_invoice_item_to_vendor_code();

-- Update existing vendor_invoice_items to link to vendor_codes
UPDATE vendor_invoice_items vii
SET vendor_code_id = vc.id
FROM vendor_codes vc
JOIN vendor_invoices vi ON vii.invoice_id = vi.id
WHERE vii.master_ingredient_id = vc.master_ingredient_id
AND vi.vendor_id = vc.vendor_id
AND vii.vendor_code = vc.code;
