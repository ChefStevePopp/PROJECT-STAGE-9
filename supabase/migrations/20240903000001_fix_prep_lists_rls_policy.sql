-- Fix RLS policies for prep_lists table

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Organization members can view their prep lists" ON prep_lists;
DROP POLICY IF EXISTS "Organization members can insert their prep lists" ON prep_lists;
DROP POLICY IF EXISTS "Organization members can update their prep lists" ON prep_lists;
DROP POLICY IF EXISTS "Organization members can delete their prep lists" ON prep_lists;

-- Enable RLS on the table
ALTER TABLE prep_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for organization members with more permissive access
CREATE POLICY "Organization members can view their prep lists"
  ON prep_lists
  FOR SELECT
  USING (true);

CREATE POLICY "Organization members can insert their prep lists"
  ON prep_lists
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Organization members can update their prep lists"
  ON prep_lists
  FOR UPDATE
  USING (true);

CREATE POLICY "Organization members can delete their prep lists"
  ON prep_lists
  FOR DELETE
  USING (true);
