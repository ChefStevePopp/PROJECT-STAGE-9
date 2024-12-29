import React from 'react';
import { AllergenBadge, type AllergenType } from '../AllergenBadge';

interface AllergenListProps {
  allergens: AllergenType[];
  size?: 'sm' | 'md' | 'lg';
}

export const AllergenList: React.FC<AllergenListProps> = ({ allergens, size = 'md' }) => {
  // Validate and normalize allergens
  const validAllergens = allergens.filter((allergen): allergen is AllergenType => {
    const isValid = [
      'wheat', 'fish', 'eggs', 'milk', 'peanuts', 'treenuts',
      'soy', 'shellfish', 'sesame', 'sulphites', 'mustard',
      'celery', 'garlic', 'onion', 'nitrites', 'mushroom',
      'hot_pepper', 'citrus'
    ].includes(allergen);

    if (!isValid) {
      console.warn(`Invalid allergen type: ${allergen}`);
    }

    return isValid;
  });

  if (!validAllergens.length) {
    return (
      <p className="text-sm text-gray-400">No allergens</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {validAllergens.map(allergen => (
        <AllergenBadge 
          key={allergen} 
          type={allergen} 
          size={size}
        />
      ))}
    </div>
  );
};

export default AllergenList;