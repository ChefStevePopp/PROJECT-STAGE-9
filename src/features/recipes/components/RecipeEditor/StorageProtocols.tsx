import React from 'react';
import {
  Thermometer,
  AlertTriangle,
  Clock,
  Box,
  Info,
  Shield,
  Scale,
} from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { useOperationsStore } from '@/stores/operationsStore';

interface StorageProtocolsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const StorageProtocols: React.FC<StorageProtocolsProps> = ({
  recipe,
  onChange,
}) => {
  const { settings } = useOperationsStore();

  const updateStorage = (updates: Partial<Recipe['storage']>) => {
    onChange({
      storage: {
        ...recipe.storage,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Storage Location */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-amber-400" />
          Storage Location
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Storage Area
            </label>
            <select
              value={recipe.storage?.location || ''}
              onChange={(e) => updateStorage({ location: e.target.value })}
              className="input w-full"
            >
              <option value="">Select storage area...</option>
              {settings?.storage_areas?.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Container Type
            </label>
            <select
              value={recipe.storage?.containerType || ''}
              onChange={(e) => updateStorage({ containerType: e.target.value })}
              className="input w-full"
            >
              <option value="">Select container type...</option>
              {settings?.container_types?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Temperature Controls */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          Temperature Controls
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Target Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage?.temperature?.value || 40}
                onChange={(e) =>
                  updateStorage({
                    temperature: {
                      ...recipe.storage?.temperature,
                      value: parseFloat(e.target.value),
                    },
                  })
                }
                className="input flex-1"
                step="0.1"
              />
              <select
                value={recipe.storage?.temperature?.unit || 'F'}
                onChange={(e) =>
                  updateStorage({
                    temperature: {
                      ...recipe.storage?.temperature,
                      unit: e.target.value as 'F' | 'C',
                    },
                  })
                }
                className="input w-20"
              >
                <option value="F">°F</option>
                <option value="C">°C</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tolerance (±)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage?.temperature?.tolerance || 2}
                onChange={(e) =>
                  updateStorage({
                    temperature: {
                      ...recipe.storage?.temperature,
                      tolerance: parseFloat(e.target.value),
                    },
                  })
                }
                className="input flex-1"
                min="0"
                step="0.1"
              />
              <div className="input w-20 bg-gray-700 flex items-center justify-center">
                {recipe.storage?.temperature?.unit || 'F'}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Acceptable Range
            </label>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <p className="text-white">
                {(recipe.storage?.temperature?.value || 40) -
                  (recipe.storage?.temperature?.tolerance || 2)}
                ° -
                {(recipe.storage?.temperature?.value || 40) +
                  (recipe.storage?.temperature?.tolerance || 2)}
                °{recipe.storage?.temperature?.unit || 'F'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Shelf Life */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-rose-400" />
          Shelf Life
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Duration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={recipe.storage?.shelfLife?.value || 1}
                onChange={(e) =>
                  updateStorage({
                    shelfLife: {
                      ...recipe.storage?.shelfLife,
                      value: parseInt(e.target.value),
                    },
                  })
                }
                className="input flex-1"
                min="1"
                step="1"
              />
              <select
                value={recipe.storage?.shelfLife?.unit || 'days'}
                onChange={(e) =>
                  updateStorage({
                    shelfLife: {
                      ...recipe.storage?.shelfLife,
                      unit: e.target.value as 'hours' | 'days' | 'weeks',
                    },
                  })
                }
                className="input w-32"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Special Instructions
            </label>
            <textarea
              value={recipe.storage?.specialInstructions?.join('\n') || ''}
              onChange={(e) =>
                updateStorage({
                  specialInstructions: e.target.value
                    .split('\n')
                    .filter(Boolean),
                })
              }
              className="input w-full h-24"
              placeholder="Enter any special storage or handling instructions..."
            />
          </div>
        </div>
      </div>

      {/* Safety Warnings */}
      <div className="bg-yellow-500/10 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">Storage Safety</p>
            <p className="text-sm text-gray-300 mt-1">
              Ensure proper temperature control and storage conditions are
              maintained at all times. Monitor shelf life and rotate stock
              according to FIFO principles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
