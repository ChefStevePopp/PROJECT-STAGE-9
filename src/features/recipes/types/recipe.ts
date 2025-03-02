export interface Recipe {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: "prepared" | "final";
  status: "draft" | "review" | "approved" | "archived";
  station?: string;
  prep_time: number;
  cook_time: number;
  rest_time?: number;
  total_time?: number;
  yield_amount: number;
  yield_unit: string;
  recipe_unit_ratio?: string;
  unit_type?: string;
  cost_per_unit?: number;
  labor_cost_per_hour?: number;
  total_cost?: number;
  target_cost_percent?: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  equipment?: EquipmentItem[];
  allergens?: {
    contains: string[];
    mayContain?: string[];
    crossContactRisk?: string[];
  };
  quality_standards?: QualityStandards;
  media?: RecipeMedia[];
  training?: RecipeTraining;
  storage?: RecipeStorage;
  production_notes?: string;
  primary_station?: string;
  secondary_station?: string;
  version?: string;
  versions?: any[];
  label_requirements?: LabelRequirements;
  use_label_printer?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  modified_by?: string;
  approved_by?: string;
  approved_at?: string;
  last_reviewed_at?: string;
  last_reviewed_by?: string;
  // View-only fields
  station_name?: string;
  major_group_name?: string;
  category_name?: string;
  sub_category_name?: string;
  // Image URL (legacy field)
  image_url?: string;
  major_group?: string | null;
  category?: string | null;
  sub_category?: string | null;
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

export interface EquipmentItem {
  id: string;
  name: string;
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
  type: "image" | "video" | "external-video";
  url: string;
  provider?: "youtube" | "vimeo";
  title?: string;
  description?: string;
  step_id?: string;
  is_primary?: boolean;
  tags?: string[];
  timestamp?: number;
  sort_order?: number;
}

export interface QualityStandards {
  appearance_description?: string;
  appearance_image_urls?: string[];
  texture_points?: string[];
  taste_points?: string[];
  aroma_points?: string[];
  plating_instructions?: string;
  plating_image_urls?: string[];
  temperature?: {
    value: number;
    unit: "F" | "C";
    tolerance?: number;
  };
}

export interface RecipeTraining {
  requiredSkillLevel?: "beginner" | "intermediate" | "advanced" | "expert";
  certificationRequired?: string[];
  keyTechniques?: string[];
  commonErrors?: string[];
  safetyProtocols?: string[];
  qualityStandards?: string[];
  notes?: string;
}

export interface RecipeStorage {
  primary_area?: string;
  secondary_area?: string;
  container?: string;
  container_type?: string;
  shelf_life_duration?: number;
  shelf_life_unit?: "hours" | "days" | "weeks" | "months";
  storage_temp?: number;
  storage_temp_unit?: "F" | "C";
  temp_tolerance?: number;
  temp_tolerance_unit?: "F" | "C";
  thawing_required?: boolean;
  thawing_instructions?: string;
  expiration_guidelines?: string;
  temperature_notes?: string;
  notes?: string;
  primary_image_url?: string;
  secondary_image_url?: string;
  is_critical_control_point?: boolean;
}

export interface RecipeVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changes: string[];
  revertedFrom?: string;
  approved?: {
    by: string;
    at: string;
    notes?: string;
  };
}

export interface LabelRequirements {
  required_fields: string[];
  custom_fields?: string[];
  description?: string;
  example_photo_url?: string | null;
  example_photo_description?: string | null;
  use_label_printer?: boolean;
}

export interface RecipeEquipment {
  id: string;
  name: string;
}
