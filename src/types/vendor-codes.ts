export interface VendorCode {
  id: string;
  organization_id: string;
  master_ingredient_id: string;
  vendor_id: string;
  code: string;
  variation_label?: string;
  note?: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorCodeWithIngredient extends VendorCode {
  ingredient_name: string;
}

export interface VendorPriceHistory {
  id: string;
  organization_id: string;
  master_ingredient_id: string;
  vendor_id: string;
  vendor_code_id: string;
  price: number;
  effective_date: string;
  invoice_id?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface VendorPriceTrend {
  master_ingredient_id: string;
  ingredient_name: string;
  vendor_id: string;
  price: number;
  effective_date: string;
  organization_id: string;
  previous_price: number | null;
  price_change_percent: number;
}
