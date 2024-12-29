import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { StorageLocation } from './StorageLocation';
import { TemperatureControls } from './TemperatureControls';
import { ShelfLife } from './ShelfLife';
import { LabelRequirements } from './LabelRequirements';
import type { Recipe } from '../../../types/recipe';
import { useOperationsStore } from '@/stores/operationsStore';

interface StorageProtocolsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const StorageProtocols: React.FC<StorageProtocolsProps> = ({
  recipe,
  onChange
}) => {
  const { settings } = useOperationsStore();

  const updateStorage = (updates: Partial<Recipe['storage']>) => {
    onChange({
      storage: {
        ...recipe.storage,
        ...updates
      }
    });
  };

  return (
    <div className="space-y-6">
      <StorageLocation 
        storage={recipe.storage} 
        settings={settings}
        onChange={updateStorage}
      />

      <TemperatureControls 
        storage={recipe.storage}
        onChange={updateStorage}
      />

      <ShelfLife 
        storage={recipe.storage}
        settings={settings}
        onChange={updateStorage}
      />

      <LabelRequirements 
        recipe={recipe}
        onChange={onChange}
      />

      {/* Safety Warnings */}
      <div className="bg-yellow-500/10 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Storage Safety</p>
            <p className="text-sm text-gray-300 mt-1">
              Ensure proper temperature control and storage conditions are maintained at all times.
              Monitor shelf life and rotate stock according to FIFO principles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};