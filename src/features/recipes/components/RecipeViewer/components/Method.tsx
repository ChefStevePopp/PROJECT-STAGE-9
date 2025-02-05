import React from "react";
import { Book } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface MethodProps {
  recipe: Recipe;
}

export const Method: React.FC<MethodProps> = ({ recipe }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Book className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Method</h2>
          <p className="text-sm text-gray-400">Step by step instructions</p>
        </div>
      </div>

      <div className="space-y-4">
        {recipe.steps?.map((step, index) => (
          <div key={step.id} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-white">{step.instruction}</p>
                {step.notes && (
                  <p className="text-sm text-gray-400 mt-2">{step.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!recipe.steps || recipe.steps.length === 0) && (
        <div className="text-center py-8 text-gray-400">
          No steps have been added to this recipe.
        </div>
      )}
    </div>
  );
};
