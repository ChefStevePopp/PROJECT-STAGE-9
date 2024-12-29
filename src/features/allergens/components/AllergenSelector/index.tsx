import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AllergenBadge } from '../AllergenBadge';
import type { MasterIngredient } from '@/types/master-ingredient';

interface AllergenSelectorProps {
  ingredient: Partial<MasterIngredient>;
  onChange: (updates: Partial<MasterIngredient>) => void;
  className?: string;
}

export const AllergenSelector: React.FC<AllergenSelectorProps> = ({
  ingredient,
  onChange,
  className = ''
}) => {
  const handleAllergenToggle = (allergenKey: string) => {
    const key = `allergen${allergenKey.charAt(0).toUpperCase() + allergenKey.slice(1)}` as keyof MasterIngredient;
    onChange({
      [key]: !ingredient[key]
    });
  };

  // Group allergens by severity
  const highPriorityAllergens = [
    { key: 'peanut', active: ingredient.allergenPeanut || false },
    { key: 'crustacean', active: ingredient.allergenCrustacean || false },
    { key: 'treenut', active: ingredient.allergenTreenut || false },
    { key: 'shellfish', active: ingredient.allergenShellfish || false },
    { key: 'sesame', active: ingredient.allergenSesame || false }
  ];

  const mediumPriorityAllergens = [
    { key: 'soy', active: ingredient.allergenSoy || false },
    { key: 'fish', active: ingredient.allergenFish || false },
    { key: 'wheat', active: ingredient.allergenWheat || false },
    { key: 'milk', active: ingredient.allergenMilk || false },
    { key: 'sulphite', active: ingredient.allergenSulphite || false },
    { key: 'egg', active: ingredient.allergenEgg || false },
    { key: 'gluten', active: ingredient.allergenGluten || false },
    { key: 'mustard', active: ingredient.allergenMustard || false },
    { key: 'pork', active: ingredient.allergenPork || false }
  ];

  const lowPriorityAllergens = [
    { key: 'celery', active: ingredient.allergenCelery || false },
    { key: 'garlic', active: ingredient.allergenGarlic || false },
    { key: 'onion', active: ingredient.allergenOnion || false },
    { key: 'nitrite', active: ingredient.allergenNitrite || false },
    { key: 'mushroom', active: ingredient.allergenMushroom || false },
    { key: 'hot_pepper', active: ingredient.allergenHotPepper || false },
    { key: 'citrus', active: ingredient.allergenCitrus || false }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/allergens/components/AllergenSelector/index.tsx
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
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleAllergenToggle(key)}
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-red-500 focus:ring-red-500"
              />
              <AllergenBadge 
                type={key as AllergenType}
                showLabel 
                className="group-hover:scale-105 transition-transform"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Medium Priority Allergens */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-yellow-400">Medium Priority Allergens</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediumPriorityAllergens.map(({ key, active }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleAllergenToggle(key)}
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500"
              />
              <AllergenBadge 
                type={key as AllergenType}
                showLabel 
                className="group-hover:scale-105 transition-transform"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Low Priority Allergens */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-blue-400">Low Priority Allergens</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {lowPriorityAllergens.map(({ key, active }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={active}
                onChange={() => handleAllergenToggle(key)}
                className="form-checkbox rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <AllergenBadge 
                type={key as AllergenType}
                showLabel 
                className="group-hover:scale-105 transition-transform"
              />
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
                  checked={ingredient[`allergenCustom${index}Active` as keyof MasterIngredient] as boolean}
                  onChange={(e) => onChange({
                    [`allergenCustom${index}Active`]: e.target.checked
                  })}
                  className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-300">Custom Allergen {index}</span>
              </label>
              <input
                type="text"
                value={ingredient[`allergenCustom${index}Name` as keyof MasterIngredient] as string || ''}
                onChange={(e) => onChange({
                  [`allergenCustom${index}Name`]: e.target.value
                })}
                placeholder="Enter allergen name"
                className="input flex-1 text-sm"
                disabled={!ingredient[`allergenCustom${index}Active` as keyof MasterIngredient]}
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
          value={ingredient.allergenNotes || ''}
          onChange={(e) => onChange({
            allergenNotes: e.target.value
          })}
          className="input w-full h-24"
          placeholder="Enter any additional allergen information or handling requirements..."
        />
      </div>
    </div>
  );
};