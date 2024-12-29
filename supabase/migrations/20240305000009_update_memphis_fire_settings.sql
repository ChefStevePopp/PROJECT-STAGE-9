-- Update Memphis Fire BBQ Company organization settings
DO $$
BEGIN
  -- Update the organization settings
  UPDATE organizations
  SET 
    settings = jsonb_build_object(
      'business_type', 'restaurant',
      'default_timezone', 'America/Toronto',
      'multi_unit', false,
      'currency', 'CAD',
      'date_format', 'MM/DD/YYYY',
      'time_format', '12h'
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';

  -- Verify the update
  IF NOT EXISTS (
    SELECT 1 
    FROM organizations 
    WHERE id = 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e'
    AND settings IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Failed to update organization settings';
  END IF;

END $$;