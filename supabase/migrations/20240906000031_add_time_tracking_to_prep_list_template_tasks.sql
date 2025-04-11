-- Add time tracking columns to prep_list_template_tasks table
ALTER TABLE prep_list_template_tasks
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_pause_time INTEGER DEFAULT 0;

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE prep_list_template_tasks;