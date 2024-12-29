import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { BasicInformation } from './BasicInformation';
import { PurchaseUnits } from './PurchaseUnits';
import { RecipeUnits } from './RecipeUnits';
import { AllergenSection } from './AllergenSection';
import { useOperationsStore } from '@/stores/operationsStore';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
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
  const { fetchGroups } = useFoodRelationshipsStore();

  // Fetch required data on mount
  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      fetchGroups();
    }
  }, [isOpen, fetchSettings, fetchGroups]);

  // Reset form data when ingredient changes
  useEffect(() => {
    setFormData(ingredient);
  }, [ingredient]);

  // Calculate cost per recipe unit whenever relevant fields change
  useEffect(() => {
    const casePrice = Number(formData.currentPrice) || 0;
    const recipeUnitsPerCase = Number(formData.recipeUnitPerPurchaseUnit) || 1;
    const yieldPercent = (Number(formData.yieldPercent) || 1);

    const costPerUnit = casePrice / recipeUnitsPerCase;
    const adjustedCost = costPerUnit * (1 / yieldPercent);

    // Only update if the cost has actually changed
    if (adjustedCost !== formData.costPerRecipeUnit) {
      setFormData(prev => ({
        ...prev,
        costPerRecipeUnit: Number(adjustedCost.toFixed(4))
      }));
    }
  }, [formData.currentPrice, formData.recipeUnitPerPurchaseUnit, formData.yieldPercent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Prepare data for database
      const dbFormData = {
        ...formData,
        // Convert numeric fields
        current_price: Number(formData.currentPrice),
        units_per_case: Number(formData.unitsPerCase),
        recipe_unit_per_purchase_unit: Number(formData.recipeUnitPerPurchaseUnit),
        yield_percent: Number(formData.yieldPercent),
        cost_per_recipe_unit: Number(formData.costPerRecipeUnit),
        
        // Convert camelCase to snake_case
        item_code: formData.itemCode,
        major_group: formData.majorGroup,
        sub_category: formData.subCategory,
        case_size: formData.caseSize,
        unit_of_measure: formData.unitOfMeasure,
        recipe_unit_type: formData.recipeUnitType,
        image_url: formData.imageUrl,
        storage_area: formData.storageArea,
        
        // Allergen fields
        allergen_peanut: formData.allergenPeanut,
        allergen_crustacean: formData.allergenCrustacean,
        allergen_treenut: formData.allergenTreenut,
        allergen_shellfish: formData.allergenShellfish,
        allergen_sesame: formData.allergenSesame,
        allergen_soy: formData.allergenSoy,
        allergen_fish: formData.allergenFish,
        allergen_wheat: formData.allergenWheat,
        allergen_milk: formData.allergenMilk,
        allergen_sulphite: formData.allergenSulphite,
        allergen_egg: formData.allergenEgg,
        allergen_gluten: formData.allergenGluten,
        allergen_mustard: formData.allergenMustard,
        allergen_celery: formData.allergenCelery,
        allergen_garlic: formData.allergenGarlic,
        allergen_onion: formData.allergenOnion,
        allergen_nitrite: formData.allergenNitrite,
        allergen_mushroom: formData.allergenMushroom,
        allergen_hot_pepper: formData.allergenHotPepper,
        allergen_citrus: formData.allergenCitrus,
        allergen_pork: formData.allergenPork,
        allergen_custom1_name: formData.allergenCustom1Name,
        allergen_custom1_active: formData.allergenCustom1Active,
        allergen_custom2_name: formData.allergenCustom2Name,
        allergen_custom2_active: formData.allergenCustom2Active,
        allergen_custom3_name: formData.allergenCustom3Name,
        allergen_custom3_active: formData.allergenCustom3Active,
        allergen_notes: formData.allergenNotes
      };

      console.log('Saving ingredient with cost:', dbFormData.cost_per_recipe_unit);
      
      await onSave(ingredient.id!, dbFormData);
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
          src/features/admin/components/sections/recipe/MasterIngredientList/EditIngredientModal/index.tsx
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
                <Save className="w-5 h-5 mr-2" />
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
