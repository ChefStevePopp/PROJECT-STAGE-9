-- Add template_ids array column to prep_lists table
ALTER TABLE public.prep_lists ADD COLUMN template_ids uuid[] DEFAULT '{}'::uuid[];

-- Update the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.prep_lists;