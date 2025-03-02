import React from "react";
import { Book } from "lucide-react";
import { PrimaryInfo } from "./PrimaryInfo";
import { IngredientsInput } from "./IngredientsInput";
import { CostingSummary } from "./CostingSummary";
import type { Recipe } from "/src/stores/recipeStore.ts";
import type { OperationsSettings } from "@/types/operations";

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Book className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Basic Information
            </h2>
            <p className="text-gray-400">
              Manage recipe details, ingredients, and costing
            </p>
          </div>
        </div>
      </div>

      {/* Primary Recipe Information */}
      <div className="card p-6 relative z-10">
        <PrimaryInfo recipe={recipe} onChange={onChange} settings={settings} />
      </div>

      {/* Recipe Ingredients */}
      <div className="card p-6 relative z-30">
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
