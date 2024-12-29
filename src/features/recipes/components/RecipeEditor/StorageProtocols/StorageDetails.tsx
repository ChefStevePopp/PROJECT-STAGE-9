import React from 'react';
import { Box } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';
import { useOperationsStore } from '@/stores/operationsStore';

interface StorageDetailsProps {
  storage: NonNullable<Recipe['storage']>;
  onChange: (updates: Partial<Recipe['storage']>) => void;
}

export const StorageDetails: React.FC<StorageDetailsProps> = ({
  storage,
  onChange
}) => {
  const { settings } = useOperationsStore();

  // Use settings from operations store or fallback to defaults
  const storageAreas = settings?.storage_areas || [];
  const containerTypes = settings?.container_types || [];
  const shelfLifeOptions = settings?.shelf_life_options || [];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Box className="w-5 h-5 text-amber-400" />
        Storage Details
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Storage Area
          </label>
          <select
            value={storage.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select storage area...</option>
            {storageAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Container Type
          </label>
          <select
            value={storage.containerType || ''}
            onChange={(e) => onChange({ containerType: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select container type...</option>
            {containerTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Storage Container
          </label>
          <input
            type="text"
            value={storage.container || ''}
            onChange={(e) => onChange({ container: e.target.value })}
            className="input w-full"
            placeholder="e.g., 4qt Cambro with red lid"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Shelf Life
          </label>
          <select
            value={storage.shelfLife || ''}
            onChange={(e) => onChange({ shelfLife: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select shelf life...</option>
            {shelfLifeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Special Storage Instructions
        </label>
        <textarea
          value={storage.specialInstructions?.join('\n') || ''}
          onChange={(e) => onChange({
            specialInstructions: e.target.value.split('\n').filter(Boolean)
          })}
          className="input w-full h-24"
          placeholder="Enter any special storage instructions or handling requirements..."
        />
      </div>
    </div>
  );
};