import React from "react";
import { Package } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface StorageProps {
  recipe: Recipe;
}

export const Storage: React.FC<StorageProps> = ({ recipe }) => {
  const storage = recipe.storage || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Package className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">
            Storage Requirements
          </h2>
          <p className="text-sm text-gray-400">
            Storage conditions and shelf life
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Storage Location
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Primary Storage Area</div>
              <div className="text-lg font-medium text-white">
                {storage.primary_area || "Not specified"}
              </div>
            </div>
            {storage.secondary_area && (
              <div>
                <div className="text-sm text-gray-400">
                  Secondary Storage Area
                </div>
                <div className="text-lg font-medium text-white">
                  {storage.secondary_area}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Storage Container
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Container Type</div>
              <div className="text-lg font-medium text-white">
                {storage.container_type || "Not specified"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Container Size</div>
              <div className="text-lg font-medium text-white">
                {storage.container || "Not specified"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Shelf Life</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-400">Duration</div>
            <div className="text-lg font-medium text-white">
              {storage.shelf_life_duration
                ? `${storage.shelf_life_duration} ${storage.shelf_life_unit}`
                : "Not specified"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Storage Temperature</div>
            <div className="text-lg font-medium text-white">
              {storage.storage_temp
                ? `${storage.storage_temp}°${storage.storage_temp_unit}`
                : "Not specified"}
            </div>
          </div>
        </div>
      </div>

      {storage.notes && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Storage Notes
          </h3>
          <p className="text-gray-400">{storage.notes}</p>
        </div>
      )}
    </div>
  );
};
