import React from 'react';
import { PrimaryInfo } from './PrimaryInfo';
import { IngredientsInput } from './IngredientsInput';
import { CostingSummary } from './CostingSummary';
import type { Recipe } from '/src/stores/recipeStore.ts';
import type { OperationsSettings } from '@/types/operations';

interface BasicInformationProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
  settings: OperationsSettings;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  recipe,
  onChange,
  settings,
}) => {
  return (
    <div className="space-y-8 relative">
      {/* Primary Recipe Information */}
      <div className="card p-6 relative z-10">
        <PrimaryInfo recipe={recipe} onChange={onChange} settings={settings} />
      </div>

      {/* Recipe Ingredients */}
      <div className="card p-6 relative z-40">
        <IngredientsInput recipe={recipe} onChange={onChange} />
      </div>

      {/* Recipe Costing */}
      <div className="card p-6 relative z-20">
        <CostingSummary
          recipe={recipe}
          onChange={onChange}
          settings={settings}
        />
      </div>
    </div>
  );
};
export default BasicInformation;
