export interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
  categories: {
    id: string;
    label: string;
  }[];
}

export interface OperationsSettings {
  id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  vendors: string[];
  storage_areas: string[];
  storage_containers: string[];
  container_types: string[];
  kitchen_stations: string[];
  label_templates: string[];
  printer_settings: any;
  category_groups?: CategoryGroup[];
  [key: string]: any; // Allow for dynamic category keys
}
