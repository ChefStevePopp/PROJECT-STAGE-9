-- Add operating_schedule to organizations settings
DO $$
DECLARE
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  -- Update Memphis Fire BBQ operating hours
  UPDATE organizations
  SET settings = settings || jsonb_build_object(
    'operating_schedule', jsonb_build_object(
      'Monday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '20:00')
      ),
      'Tuesday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '20:00')
      ),
      'Wednesday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '20:00')
      ),
      'Thursday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '20:00')
      ),
      'Friday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '21:00')
      ),
      'Saturday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '21:00')
      ),
      'Sunday', jsonb_build_array(
        jsonb_build_object('open', '11:00', 'close', '20:00')
      )
    )
  )
  WHERE id = org_id;
END $$;