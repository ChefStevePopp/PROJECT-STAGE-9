import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppearanceStandards } from './AppearanceStandards';
import { TextureStandards } from './TextureStandards';
import { TasteStandards } from './TasteStandards';
import { PlatingStandards } from './PlatingStandards';
import type { Recipe } from '../../../types/recipe';
import { useOperationsStore } from '@/stores/operationsStore';

interface QualityStandardsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const QualityStandards: React.FC<QualityStandardsProps> = ({
  recipe,
  onChange
}) => {
  const { settings } = useOperationsStore();

  const updateQualityStandards = (updates: Partial<Recipe['qualityStandards']>) => {
    onChange({
      qualityStandards: {
        ...recipe.qualityStandards,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      <AppearanceStandards 
        qualityStandards={recipe.qualityStandards}
        onChange={updateQualityStandards}
      />

      <TextureStandards 
        qualityStandards={recipe.qualityStandards}
        onChange={updateQualityStandards}
      />

      <TasteStandards 
        qualityStandards={recipe.qualityStandards}
        onChange={updateQualityStandards}
      />

      <PlatingStandards 
        qualityStandards={recipe.qualityStandards}
        onChange={updateQualityStandards}
      />

      {/* Quality Control Warning */}
      <div className="bg-yellow-500/10 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Quality Control</p>
            <p className="text-sm text-gray-300 mt-1">
              Ensure all quality standards are clearly documented and communicated to staff.
              Regular quality checks should be performed during preparation and service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};