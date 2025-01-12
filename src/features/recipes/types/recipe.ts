export interface Recipe {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: "prepared" | "final";
  status: "draft" | "review" | "approved" | "archived";
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  created_at?: string;
  updated_at?: string;
  label_requirements?: {
    required_fields: string[];
    custom_fields?: string[];
    description?: string;
    example_photo_url?: string | null;
    example_photo_description?: string | null;
    use_label_printer?: boolean;
  };
}

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  cost: number;
  commonMeasure?: string;
}

export interface RecipeStep {
  id: string;
  instruction: string;
  notes?: string;
  warning_level?: "low" | "medium" | "high";
  time_in_minutes?: number;
  temperature?: {
    value: number;
    unit: "F" | "C";
  };
  is_quality_control_point?: boolean;
  is_critical_control_point?: boolean;
  media?: RecipeMedia[];
}

export interface RecipeMedia {
  id: string;
  type: "image" | "video";
  url: string;
  title?: string;
  description?: string;
  step_id?: string;
  is_primary?: boolean;
  tags?: string[];
  sort_order?: number;
}
