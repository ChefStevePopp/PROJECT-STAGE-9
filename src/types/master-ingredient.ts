export interface MasterIngredient {
  id: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
  item_code: string;
  major_group: string;
  category: string;
  sub_category: string;
  product: string;
  vendor: string;
  case_size: string;
  units_per_case: number;
  recipe_unit_type: string;
  yield_percent: number;
  cost_per_recipe_unit: number;
  image_url: string | null;
  storage_area: string;
  allergen_peanut: boolean;
  allergen_crustacean: boolean;
  allergen_treenut: boolean;
  allergen_shellfish: boolean;
  allergen_sesame: boolean;
  allergen_soy: boolean;
  allergen_fish: boolean;
  allergen_wheat: boolean;
  allergen_milk: boolean;
  allergen_sulphite: boolean;
  allergen_egg: boolean;
  allergen_gluten: boolean;
  allergen_mustard: boolean;
  allergen_celery: boolean;
  allergen_garlic: boolean;
  allergen_onion: boolean;
  allergen_nitrite: boolean;
  allergen_mushroom: boolean;
  allergen_hot_pepper: boolean;
  allergen_citrus: boolean;
  allergen_pork: boolean;
  allergen_custom1_name: string | null;
  allergen_custom1_active: boolean;
  allergen_custom2_name: string | null;
  allergen_custom2_active: boolean;
  allergen_custom3_name: string | null;
  allergen_custom3_active: boolean;
  allergen_notes: string | null;
  major_group_name: string;
  category_name: string;
  sub_category_name: string;
}

export interface MasterIngredientFormData
  extends Omit<
    MasterIngredient,
    | "id"
    | "created_at"
    | "updated_at"
    | "organization_id"
    | "major_group_name"
    | "category_name"
    | "sub_category_name"
  > {}
