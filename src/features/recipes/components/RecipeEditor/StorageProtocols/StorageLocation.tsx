import React from 'react';
import { Box } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';
import type { OperationsSettings } from '@/types/operations';

interface StorageLocationProps {
  storage?: Recipe['storage'];
  settings: OperationsSettings | null;
  onChange: (updates: Partial<Recipe['storage']>) => void;
}

export const StorageLocation: React.FC<StorageLocationProps> = ({
  storage,
  settings,
  onChange
}) => {
  // Get container types filtered by storage area if applicable
  const getContainerTypes = () => {
    if (!storage?.location) return settings?.container_types || [];
    // In the future, we could filter container types by storage area
    return settings?.container_types || [];
  };

  // Get storage containers filtered by container type if applicable
  const getStorageContainers = () => {
    if (!storage?.containerType) return settings?.storage_containers || [];
    // In the future, we could filter containers by container type
    return settings?.storage_containers || [];
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Box className="w-5 h-5 text-amber-400" />
        Storage Location
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Storage Area
          </label>
          <select
            value={storage?.location || ''}
            onChange={(e) => onChange({ location: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select storage area...</option>
            {settings?.storage_areas?.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Where this item should be stored
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Container Type
          </label>
          <select
            value={storage?.containerType || ''}
            onChange={(e) => onChange({ containerType: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select container type...</option>
            {getContainerTypes().map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Type of container to use
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Storage Container
          </label>
          <select
            value={storage?.container || ''}
            onChange={(e) => onChange({ container: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select container...</option>
            {getStorageContainers().map(container => (
              <option key={container} value={container}>{container}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Specific container size
          </p>
        </div>
      </div>
    </div>
  );
};