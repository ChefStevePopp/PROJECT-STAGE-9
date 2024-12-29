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
