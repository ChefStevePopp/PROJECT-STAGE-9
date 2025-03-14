import { MasterIngredient } from "./master-ingredient";

export interface UmbrellaIngredient {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  major_group?: string;
  category?: string;
  sub_category?: string;
  primary_master_ingredient_id?: string;
  created_at?: string;
  updated_at?: string;
  master_ingredients?: string[];
  major_group_name?: string;
  category_name?: string;
  sub_category_name?: string;
  // Primary ingredient data
  recipe_unit_type?: string;
  cost_per_recipe_unit?: number;
  storage_area?: string;
  // Allergen data
  allergen_peanut?: boolean;
  allergen_crustacean?: boolean;
  allergen_treenut?: boolean;
  allergen_shellfish?: boolean;
  allergen_sesame?: boolean;
  allergen_soy?: boolean;
  allergen_fish?: boolean;
  allergen_wheat?: boolean;
  allergen_milk?: boolean;
  allergen_sulphite?: boolean;
  allergen_egg?: boolean;
  allergen_gluten?: boolean;
  allergen_mustard?: boolean;
  allergen_celery?: boolean;
  allergen_garlic?: boolean;
  allergen_onion?: boolean;
  allergen_nitrite?: boolean;
  allergen_mushroom?: boolean;
  allergen_hot_pepper?: boolean;
  allergen_citrus?: boolean;
  allergen_pork?: boolean;
  allergen_custom1_name?: string | null;
  allergen_custom1_active?: boolean;
  allergen_custom2_name?: string | null;
  allergen_custom2_active?: boolean;
  allergen_custom3_name?: string | null;
  allergen_custom3_active?: boolean;
  allergen_notes?: string | null;
}

export interface UmbrellaIngredientWithDetails extends UmbrellaIngredient {
  master_ingredients: string[];
  master_ingredient_details: MasterIngredient[];
}
