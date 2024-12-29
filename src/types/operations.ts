export interface OperationsSettings {
  // Storage and Location Settings
  storage_areas: string[];
  kitchen_stations: string[];
  shelf_life_options: string[];
  storage_containers: string[];
  container_types: string[];
  
  // Measurement Units
  alcohol_measures?: string[];
  volume_measures?: string[];
  weight_measures?: string[];
  dry_goods_measures?: string[];
  recipe_unit_measures?: string[];
  protein_measures?: string[];
  batch_units?: string[];
  
  // Categories and Classifications
  mise_en_place_categories?: string[];
  ingredient_categories?: string[];
  ingredient_sub_categories?: Record<string, string[]>;
  
  // Business Operations
  revenue_channels?: string[];
  pos_major_groups?: string[];
  pos_family_groups?: string[];
  vendors: string[];
}