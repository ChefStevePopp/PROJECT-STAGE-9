import { MasterIngredient } from "./master-ingredient";

export interface UmbrellaIngredient {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category?: string;
  sub_category?: string;
  created_at: string;
  updated_at: string;
  master_ingredients: string[]; // Array of master_ingredient_ids
  primary_master_ingredient_id?: string; // The primary/default master ingredient
}

export interface UmbrellaIngredientWithDetails extends UmbrellaIngredient {
  master_ingredient_details: MasterIngredient[];
}
