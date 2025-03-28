-- Add acknowledged_by column to activity_logs table
ALTER TABLE public.activity_logs
ADD COLUMN acknowledged_by JSONB DEFAULT '[]'::jsonb;

-- Update RLS policies to allow authorized users to update the acknowledged_by column
DROP POLICY IF EXISTS "Allow organization members to update acknowledgements" ON public.activity_logs;
CREATE POLICY "Allow organization members to update acknowledgements"
ON public.activity_logs
FOR UPDATE
USING (organization_id IN (
  SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
))
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_roles WHERE user_id = auth.uid()
));

-- Add index for faster queries on acknowledged_by
CREATE INDEX IF NOT EXISTS idx_activity_logs_acknowledged_by ON public.activity_logs USING GIN (acknowledged_by);

alter publication supabase_realtime add table activity_logs;