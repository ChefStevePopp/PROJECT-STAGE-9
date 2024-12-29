import React, { useState } from 'react';
import { X, Save, CircleDollarSign } from 'lucide-react';
import { useOperationsStore } from '@/stores/operationsStore';
import { AllergenSelector } from '@/features/allergens/components/AllergenSelector';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import type { MasterIngredient } from '@/types';
import toast from 'react-hot-toast';

interface CreateIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateIngredientModal: React.FC<CreateIngredientModalProps> = ({
  isOpen,
  onClose
}) => {
  const { settings } = useOperationsStore();
  const { addIngredient } = useMasterIngredientsStore();
  const [formData, setFormData] = useState<Partial<MasterIngredient>>({
    itemCode: '',
    category: '',
    product: '',
    vendor: '',
    subCategory: '',
    caseSize: '',
    unitsPerCase: '',
    currentPrice: 0,
    unitOfMeasure: '',
    recipeUnitPerPurchaseUnit: 0,
    yieldPercent: 100,
    costPerRecipeUnit: 0,
    storageArea: '',
    allergenPeanut: false,
    allergenCrustacean: false,
    allergenTreenut: false,
    allergenShellfish: false,
    allergenSesame: false,
    allergenSoy: false,
    allergenFish: false,
    allergenWheat: false,
    allergenMilk: false,
    allergenSulphite: false,
    allergenEgg: false,
    allergenGluten: false,
    allergenMustard: false,
    allergenCelery: false,
    allergenGarlic: false,
    allergenOnion: false,
    allergenNitrite: false,
    allergenMushroom: false,
    allergenHotPepper: false,
    allergenCitrus: false,
    allergenPork: false,
    allergenCustom1Active: false,
    allergenCustom1Name: '',
    allergenCustom2Active: false,
    allergenCustom2Name: '',
    allergenCustom3Active: false,
    allergenCustom3Name: '',
    allergenNotes: ''
  });

  // Calculate cost per recipe unit
  const costPerRecipeUnit = (
    (formData.currentPrice || 0) / (parseFloat(formData.unitsPerCase || '1')) * 
    ((formData.yieldPercent || 100) / 100) * 
    (formData.recipeUnitPerPurchaseUnit || 1)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addIngredient(formData);
      toast.success('Ingredient created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating ingredient:', error);
      toast.error('Failed to create ingredient');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Diagnostic Text */}
        <div className="text-xs text-gray-500 font-mono">
          src/features/admin/components/sections/recipe/MasterIngredientList/CreateIngredientModal.tsx
        </div>

        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create Master Ingredient</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Item Code
                </label>
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemCode: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select category...</option>
                  {settings?.ingredient_categories?.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Sub-Category
                </label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                  className="input w-full"
                  disabled={!formData.category}
                >
                  <option value="">Select sub-category...</option>
                  {settings?.ingredient_sub_categories[formData.category || '']?.map(subCategory => (
                    <option key={subCategory} value={subCategory}>{subCategory}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Vendor
                </label>
                <select
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select vendor...</option>
                  {settings?.vendors?.map(vendor => (
                    <option key={vendor} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Storage Area
                </label>
                <select
                  value={formData.storageArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, storageArea: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select storage area...</option>
                  {settings?.storage_areas?.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Purchase Units */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Purchase Units</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Case Size
                </label>
                <input
                  type="text"
                  value={formData.caseSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, caseSize: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, unitsPerCase: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, unitOfMeasure: e.target.value }))}
                  className="input w-full"
                  required
                >
                  <option value="">Select unit...</option>
                  {[
                    ...settings?.weight_measures || [],
                    ...settings?.volume_measures || [],
                    ...settings?.dry_goods_measures || []
                  ].map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recipe Units */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-emerald-400">Recipe Units</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recipe Units per Case
                </label>
                <input
                  type="number"
                  value={formData.recipeUnitPerPurchaseUnit}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    recipeUnitPerPurchaseUnit: parseFloat(e.target.value) 
                  }))}
                  className="input w-full"
                  required
                  step="0.001"
                  min="0"
                  placeholder="Enter recipe units per case"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Yield Percentage
                </label>
                <input
                  type="number"
                  value={formData.yieldPercent}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    yieldPercent: parseFloat(e.target.value) 
                  }))}
                  className="input w-full"
                  required
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Enter yield percentage"
                />
              </div>
            </div>

            <div className="bg-emerald-500/10 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-400 font-medium">Recipe Unit Calculation</p>
                  <p className="text-lg font-semibold text-emerald-300 mt-1">
                    Cost per Recipe Unit: ${costPerRecipeUnit.toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Based on case price, recipe units per case, and yield percentage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Allergens */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Allergens</h3>
            <AllergenSelector
              ingredient={formData}
              onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Create Ingredient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};