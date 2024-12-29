export interface Recipe {
  id: string;
  organizationId: string;
  type: 'prepared' | 'final';
  name: string;
  description: string;
  majorGroup?: string;
  category?: string;
  subCategory?: string;
  station: string;
  storage?: {
    location?: string;
    container?: string;
    containerType?: string;
    labelImageUrl?: string;
    temperature?: {
      value: number;
      unit: 'F' | 'C';
      tolerance: number;
    };
    shelfLife?: {
      value: number;
      unit: 'hours' | 'days' | 'weeks';
    };
    specialInstructions?: string[];
  };
  prepTime: number;
  cookTime: number;
  recipeUnitRatio: string;
  unitType: string;
  yield: {
    amount: number;
    unit: string;
  };
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  notes: string;
  costPerServing: number;
  lastUpdated: string;
  imageUrl?: string;
  videoUrl?: string;
  allergenInfo: {
    contains: AllergenType[];
    mayContain: AllergenType[];
    crossContactRisk: AllergenType[];
  };
}

export interface RecipeIngredient {
  id: string;
  type: 'raw' | 'prepared';
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
  cost: number;
  preparedItemId?: string;
}

export interface RecipeStep {
  id: string;
  instruction: string;
  notes?: string;
  warningLevel?: 'info' | 'warning' | 'critical';
  timeInMinutes?: number;
  equipment?: string[];
  qualityChecks?: string[];
  mediaUrls?: string[];
  isQualityControlPoint?: boolean;
  isCriticalControlPoint?: boolean;
  temperature?: {
    value: number;
    unit: 'F' | 'C';
  };
}