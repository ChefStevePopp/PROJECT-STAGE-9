-- Add template_ids array column to prep_lists table
ALTER TABLE public.prep_lists ADD COLUMN template_ids uuid[] DEFAULT '{}'::uuid[];

-- Copy existing template_id values to the new template_ids array
UPDATE public.prep_lists SET template_ids = ARRAY[template_id] WHERE template_id IS NOT NULL;

-- Enable realtime for the table (this is idempotent and won't error if already enabled)
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prep_lists;
