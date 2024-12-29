import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { BasicInformation } from './BasicInformation';
import { PurchaseUnits } from './PurchaseUnits';
import { RecipeUnits } from './RecipeUnits';
import { AllergenSection } from './AllergenSection';
import { useOperationsStore } from '@/stores/operationsStore';
import type { MasterIngredient } from '@/types/master-ingredient';
import toast from 'react-hot-toast';

interface EditIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredient: MasterIngredient;
  onSave: (id: string, updates: Partial<MasterIngredient>) => Promise<void>;
}

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  isOpen,
  onClose,
  ingredient,
  onSave
}) => {
  const [formData, setFormData] = useState<MasterIngredient>(ingredient);
  const [isSaving, setIsSaving] = useState(false);
  const { settings, fetchSettings } = useOperationsStore();

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onSave(ingredient.id!, formData);
      toast.success('Ingredient updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating ingredient:', error);
      toast.error('Failed to update ingredient');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Diagnostic Text */}
        <div className="text-xs text-gray-500 font-mono">
          src/features/admin/components/sections/InventoryManagement/EditIngredientModal/index.tsx
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold text-white">Edit Master Ingredient</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <BasicInformation 
              formData={formData}
              settings={settings}
              onChange={setFormData}
            />

            <PurchaseUnits 
              formData={formData}
              settings={settings}
              onChange={setFormData}
            />

            <RecipeUnits 
              formData={formData}
              settings={settings}
              onChange={setFormData}
            />

            <AllergenSection 
              formData={formData}
              onChange={setFormData}
            />
          </div>
        </form>
      </div>
    </div>
  );
};