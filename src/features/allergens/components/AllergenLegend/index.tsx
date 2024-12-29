import React from 'react';
import { AllergenBadge, type AllergenType } from '../AllergenBadge';

const COMMON_ALLERGENS: AllergenType[] = [
  'wheat', 'fish', 'eggs', 'milk', 'peanuts', 'treenuts', 'soy',
  'shellfish', 'sesame', 'sulphites', 'mustard'
];

const OTHER_ALLERGENS: AllergenType[] = [
  'celery', 'garlic', 'onion', 'nitrites', 'mushroom', 'hot_peppers', 'citrus'
];

export const AllergenLegend: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Common Allergens</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {COMMON_ALLERGENS.map(allergen => (
            <div key={allergen} className="flex items-center gap-3">
              <AllergenBadge type={allergen} size="sm" />
              <span className="text-sm text-gray-300 capitalize">
                {allergen.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Other Sensitivities</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {OTHER_ALLERGENS.map(allergen => (
            <div key={allergen} className="flex items-center gap-3">
              <AllergenBadge type={allergen} size="sm" />
              <span className="text-sm text-gray-300 capitalize">
                {allergen.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllergenLegend;