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
}

export interface UmbrellaIngredientWithDetails extends UmbrellaIngredient {
  master_ingredients: string[];
  master_ingredient_details: MasterIngredient[];
}
