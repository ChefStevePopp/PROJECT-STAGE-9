-- Create vendor_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendor_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    organization_id uuid NOT NULL REFERENCES organizations(id),
    vendor_id text NOT NULL,
    name text NOT NULL,
    file_type text NOT NULL CHECK (file_type IN ('csv', 'pdf', 'photo')),
    column_mapping jsonb DEFAULT '{}'::jsonb,
    ocr_regions jsonb DEFAULT '{}'::jsonb
);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their organization's templates" ON vendor_templates;
DROP POLICY IF EXISTS "Users can manage their organization's templates" ON vendor_templates;

-- Enable RLS
ALTER TABLE vendor_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing and managing templates
CREATE POLICY "Users can manage their organization's templates"
    ON vendor_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM organization_team_members otm
            WHERE otm.user_id = auth.uid()
            AND otm.organization_id = vendor_templates.organization_id
            AND ('owner' = ANY(otm.kitchen_roles) OR 'chef' = ANY(otm.kitchen_roles) OR 'sous_chef' = ANY(otm.kitchen_roles))
        )
        OR EXISTS (
            SELECT 1 
            FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_user_meta_data->>'system_role' = 'dev'
        )
    );

-- Create index if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'vendor_templates_vendor_idx'
    ) THEN
        CREATE INDEX vendor_templates_vendor_idx ON vendor_templates(vendor_id);
    END IF;
END $$;