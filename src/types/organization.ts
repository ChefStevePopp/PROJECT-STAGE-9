export interface OperatingHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface DailySchedule {
  [key: string]: OperatingHours[];
}

export interface OrganizationSettings {
  business_type: 'restaurant' | 'cafe' | 'bar' | 'food_truck' | 'catering' | 'other';
  cuisine_type?: string;
  default_timezone: string;
  multi_unit: boolean;
  currency?: string;
  date_format?: string;
  time_format?: string;
  operating_schedule?: DailySchedule;
}

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  formatted_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  timezone: string;
  is_primary: boolean;
  settings: {
    pos_system?: string;
    scheduling_system?: string;
    inventory_system?: string;
    operating_schedule?: DailySchedule;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}