-- Create quality standards bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('quality-standards', 'quality-standards', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for quality standards bucket
CREATE POLICY "Give users access to own folder" ON storage.objects
  FOR ALL USING (
    bucket_id = 'quality-standards' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()
  );

-- Allow public read access to quality standards images
CREATE POLICY "Allow public read access to quality standards" ON storage.objects
  FOR SELECT USING (bucket_id = 'quality-standards');

-- Add quality_standards column to recipes if it doesn't exist
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS quality_standards JSONB DEFAULT '{}'::jsonb;