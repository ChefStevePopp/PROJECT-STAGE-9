import React from "react";
import { Wrench } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface EquipmentProps {
  recipe: Recipe;
}

export const Equipment: React.FC<EquipmentProps> = ({ recipe }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Equipment</h2>
          <p className="text-sm text-gray-400">Required tools and equipment</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Station Assignment */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Station Assignment
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Primary Station</div>
              <div className="text-lg font-medium text-white">
                {recipe.primary_station || "Not assigned"}
              </div>
            </div>
            {recipe.secondary_station && (
              <div>
                <div className="text-sm text-gray-400">Secondary Station</div>
                <div className="text-lg font-medium text-white">
                  {recipe.secondary_station}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Required Equipment
          </h3>
          {recipe.equipment?.length > 0 ? (
            <div className="space-y-2">
              {recipe.equipment.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-gray-300"
                >
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No equipment specified</p>
          )}
        </div>
      </div>

      {/* Production Notes */}
      {recipe.production_notes && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Production Notes
          </h3>
          <p className="text-gray-400">{recipe.production_notes}</p>
        </div>
      )}
    </div>
  );
};
