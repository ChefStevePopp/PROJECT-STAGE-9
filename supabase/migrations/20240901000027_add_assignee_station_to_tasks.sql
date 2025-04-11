-- Add assignee_station column to tasks table to distinguish between the original kitchen_station and the station a task is assigned to
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_station TEXT;

-- Update the realtime publication
alter publication supabase_realtime add table tasks;
