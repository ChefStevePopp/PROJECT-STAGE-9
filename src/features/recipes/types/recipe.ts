// Base type imports and definitions
import {
  AuditableEntity,
  IngredientType,
  MediaType,
  MeasurementUnit,
  RecipeStatus,
  RecipeType,
  SkillLevel,
  Temperature,
  WarningLevel,
} from './base';

export interface RecipeIngredient {
  id: string;
  master_ingredient_id?: string;    // Links to master ingredients for allergen/cost data
  prepared_recipe_id?: string;      // For when using another recipe as ingredient
  quantity: number;
  unit: string;
  notes?: string;                   // Any special instructions or variations
}

export interface RecipeEquipment {
  id: string;
  name: string;
  station: string;
  isRequired: boolean;
  specifications: string;
  alternatives?: string[];
}

export interface RecipeStep {
  id: string;
  instruction: string;
  warning_level?: WarningLevel;
  time_in_minutes?: number;
  temperature?: Temperature;
  is_quality_control_point: boolean;
  is_critical_control_point: boolean;
  equipment?: string[];  // References equipment IDs
  notes?: string;
  sort_order: number;
}

export interface RecipeMedia {
  id: string;
  type: MediaType;
  url: string;
  title?: string;
  description?: string;
  step_id?: string;
  is_primary: boolean;
  tags?: string[];
  sort_order: number;
}

export interface QualityStandards {
  appearance_description?: string;
  appearance_image_urls?: string[];
  texture_points?: string[];
  taste_points?: string[];
  aroma_points?: string[];
  plating_instructions?: string;
  plating_image_url?: string;
  temperature?: Temperature;
}

export interface RecipeTraining {
  required_skill_level?: SkillLevel;
  certification_required?: boolean;
  common_errors?: string[];
  key_techniques?: string[];
  safety_protocols?: string[];
  quality_standards?: string[];
  notes?: string;
}

export interface RecipeVersion {
  version: string;
  changes?: string[];
  reverted_from?: string;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
}

// Main Recipe type matching our table structure
export interface Recipe extends AuditableEntity {
  // Core identifiers and type
  organization_id: string;
  type: RecipeType;
  status: RecipeStatus;
  name: string;
  description?: string;

  // Classification
  major_group?: string;
  category?: string;
  sub_category?: string;
  station?: string;

  // Station assignment
  primary_station?: string;
  secondary_stations?: string[];

  // Storage Information
  storage_area?: string;
  container?: string;
  container_type?: string;
  shelf_life?: string;

  // Timing
  prep_time: number;
  cook_time: number;
  rest_time: number;
  total_time: number;

  // Units and Yield
  recipe_unit_ratio: string;
  unit_type: string;
  yield_amount: number;
  yield_unit: string;

  // Costing
  costPerUnit: number;
  labor_cost_per_hour: number;
  total_cost: number;
  target_cost_percent: number;

  // Media
  image_url?: string;
  video_url?: string;

  // Version Control
  version: string;

  // JSONB fields
  ingredients: RecipeIngredient[];     // Using our simplified ingredient structure
  steps: RecipeStep[];
  equipment: RecipeEquipment[];
  quality_standards: QualityStandards;
  allergenInfo: {
    contains: string[];
    mayContain: string[];
    crossContactRisk: string[];
  };
  media: RecipeMedia[];
  training: RecipeTraining;
  versions: RecipeVersion[];

  // Timeline
  timeline_notes?: string;

  // Approval tracking
  approved_by?: string;
  approved_at?: string;
  last_reviewed_at?: string;
  last_reviewed_by?: string;
}

// Type for creating/updating recipes
export type RecipeInput = Omit<Recipe, keyof AuditableEntity>;

// Type for recipe search/filter parameters
export interface RecipeFilters {
  type?: RecipeType;
  status?: RecipeStatus;
  searchTerm?: string;
  majorGroup?: string;
  category?: string;
  subCategory?: string;
  station?: string;
}

export type RecipeSortField = 'name' | 'updated_at' | 'type' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface RecipeSortOptions {
  field: RecipeSortField;
  direction: SortDirection;
}