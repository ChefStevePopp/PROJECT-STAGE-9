export interface Temperature {
  value: number;
  unit: 'F' | 'C';
  tolerance: number;
}

export interface ShelfLife {
  value: number;
  unit: 'hours' | 'days' | 'weeks';
}

export interface Storage {
  location?: string;
  container?: string;
  containerType?: string;
  labelImageUrl?: string;
  temperature?: Temperature;
  shelfLife?: ShelfLife;
  specialInstructions?: string[];
}
