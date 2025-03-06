-- Create inventory_counts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inventory_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.master_ingredients(id) ON DELETE CASCADE,
  count_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  quantity NUMERIC NOT NULL DEFAULT 0,
  previous_quantity NUMERIC DEFAULT 0,
  expected_quantity NUMERIC DEFAULT 0,
  unit_type TEXT,
  location TEXT,
  counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS inventory_counts_organization_id_idx ON public.inventory_counts(organization_id);
CREATE INDEX IF NOT EXISTS inventory_counts_ingredient_id_idx ON public.inventory_counts(ingredient_id);
CREATE INDEX IF NOT EXISTS inventory_counts_count_date_idx ON public.inventory_counts(count_date);

-- Grant permissions
GRANT ALL ON public.inventory_counts TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventory_counts TO authenticated;
GRANT SELECT ON public.inventory_counts TO anon;
