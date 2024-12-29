import React from 'react';
import { Package } from 'lucide-react';
import type { MasterIngredient } from '@/types/master-ingredient';
import type { OperationsSettings } from '@/types/operations';

interface PurchaseUnitsProps {
  formData: MasterIngredient;
  settings: OperationsSettings | null;
  onChange: (updates: MasterIngredient) => void;
}

export const PurchaseUnits: React.FC<PurchaseUnitsProps> = ({
  formData,
  settings,
  onChange
}) => {
  // Create a unique list of measurement units
  const measurementUnits = Array.from(new Set([
    ...(settings?.weight_measures || []),
    ...(settings?.volume_measures || []),
    ...(settings?.dry_goods_measures || [])
  ])).sort();

  return (
    <div className="space-y-4">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/InventoryManagement/EditIngredientModal/PurchaseUnits.tsx
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white">Purchase Units</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Case Size
          </label>
          <input
            type="text"
            value={formData.caseSize}
            onChange={(e) => onChange({ ...formData, caseSize: e.target.value })}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Units per Case
          </label>
          <input
            type="number"
            value={formData.unitsPerCase}
            onChange={(e) => onChange({ ...formData, unitsPerCase: e.target.value })}
            className="input w-full"
            required
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Current Price (per case)
          </label>
          <input
            type="number"
            value={formData.currentPrice}
            onChange={(e) => onChange({ ...formData, currentPrice: parseFloat(e.target.value) })}
            className="input w-full"
            required
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Unit of Measure
          </label>
          <select
            value={formData.unitOfMeasure}
            onChange={(e) => onChange({ ...formData, unitOfMeasure: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select unit...</option>
            {measurementUnits.map((unit, index) => (
              <option key={`${unit}-${index}`} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};