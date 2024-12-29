import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MasterIngredient } from '@/types/master-ingredient';

interface AllergenSectionProps {
  formData: MasterIngredient;
  onChange: (updates: MasterIngredient) => void;
}

export const AllergenSection: React.FC<AllergenSectionProps> = ({
  formData,
  onChange
}) => {
  const handleAllergenToggle = (allergenKey: string) => {
    const key = `allergen${allergenKey.charAt(0).toUpperCase() + allergenKey.slice(1)}` as keyof MasterIngredient;
    onChange({
      ...formData,
      [key]: !formData[key]
    });
  };

  // Group allergens by severity
  const highPriorityAllergens = [
    { key: 'peanut', active: formData.allergenPeanut },
    { key: 'crustacean', active: formData.allergenCrustacean },
    { key: 'treenut', active: formData.allergenTreenut },
    { key: 'shellfish', active: formData.allergenShellfish },
    { key: 'sesame', active: formData.allergenSesame }
  ];

  const mediumPriorityAllergens = [
    { key: 'soy', active: formData.allergenSoy },
    { key: 'fish', active: formData.allergenFish },
    { key: 'wheat', active: formData.allergenWheat },
    { key: 'milk', active: formData.allergenMilk },
    { key: 'sulphite', active: formData.allergenSulphite },
    { key: 'egg', active: formData.allergenEgg },
    { key: 'gluten', active: formData.allergenGluten },
    { key: 'mustard', active: formData.allergenMustard },
    { key: 'pork', active: formData.allergenPork }
  ];

  const lowPriorityAllergens = [
    { key: 'celery', active: formData.allergenCelery },
    { key: 'garlic', active: formData.allergenGarlic },
    { key: 'onion', active: formData.allergenOnion },
    { key: 'nitrite', active: formData.allergenNitrite },
    { key: 'mushroom', active: formData.allergenMushroom },
    { key: 'hotPepper', active: formData.allergenHotPepper },
    { key: 'citrus', active: formData.allergenCitrus }
  ];

  return (
    <div className="space-y-4">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/InventoryManagement/EditIngredientModal/AllergenSection.tsx
      </div>

      <div className="flex items-start gap-3 bg-yellow-500/10 rounded-lg p-4 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div>
          <p className="text-yellow-400 font-medium">Allergen Information</p>
          <p className="text-sm text-gray-300 mt-1">
            Select all allergens that apply. This information will be used for allergen warnings and cross-contamination prevention.
          </p>
        </div>
      </div>

      {/* High Priority Allergens */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-red-400">High Priority Allergens</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {highPriorityAllergens.map(({ key, active }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleAllergenToggle(key)}
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Medium Priority Allergens */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-yellow-400">Medium Priority Allergens</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediumPriorityAllergens.map(({ key, active }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleAllergenToggle(key)}
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Low Priority Allergens */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-blue-400">Low Priority Allergens</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lowPriorityAllergens.map(({ key, active }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleAllergenToggle(key)}
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Allergens */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">Custom Allergens</h4>
        {[1, 2, 3].map(index => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[`allergenCustom${index}Active` as keyof MasterIngredient] as boolean}
                  onChange={(e) => onChange({
                    ...formData,
                    [`allergenCustom${index}Active`]: e.target.checked
                  })}
                  className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-300">Custom Allergen {index}</span>
              </label>
              <input
                type="text"
                value={formData[`allergenCustom${index}Name` as keyof MasterIngredient] as string || ''}
                onChange={(e) => onChange({
                  ...formData,
                  [`allergenCustom${index}Name`]: e.target.value
                })}
                placeholder="Enter allergen name"
                className="input flex-1 text-sm"
                disabled={!formData[`allergenCustom${index}Active` as keyof MasterIngredient]}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Allergen Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Allergen Notes
        </label>
        <textarea
          value={formData.allergenNotes || ''}
          onChange={(e) => onChange({
            ...formData,
            allergenNotes: e.target.value
          })}
          className="input w-full h-24"
          placeholder="Enter any additional allergen information or handling requirements..."
        />
      </div>
    </div>
  );
};