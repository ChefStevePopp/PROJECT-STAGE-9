import React, { useEffect } from 'react';
import { AlertTriangle, Info, Shield } from 'lucide-react';
import { AllergenSelector } from '@/features/allergens/components/AllergenSelector';
import { AllergenBadge } from '@/features/allergens/components/AllergenBadge';
import type { Recipe } from '../../types/recipe';
import type { AllergenType } from '@/features/allergens/types';

interface AllergenControlProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
  masterIngredients?: any[]; // Type this properly based on your master ingredients structure
}

export const AllergenControl: React.FC<AllergenControlProps> = ({
  recipe,
  onChange,
  masterIngredients = []
}) => {
  // Auto-populate allergens from ingredients
  useEffect(() => {
    if (recipe.ingredients?.length) {
      const allAllergens = new Set<string>();

      recipe.ingredients.forEach(ingredient => {
        if (ingredient.master_ingredient_id) {
          const masterIngredient = masterIngredients.find(
            mi => mi.id === ingredient.master_ingredient_id
          );

          if (masterIngredient?.allergens) {
            masterIngredient.allergens.contains?.forEach(a => allAllergens.add(a));
            masterIngredient.allergens.mayContain?.forEach(a => allAllergens.add(a));
            masterIngredient.allergens.crossContactRisk?.forEach(a => allAllergens.add(a));
          }
        }
      });

      onChange({
        allergenInfo: {
          ...recipe.allergenInfo,
          contains: Array.from(allAllergens)
        }
      });
    }
  }, [recipe.ingredients, masterIngredients]);

  const handleAllergenChange = (allergenKey: string, isContained: boolean) => {
    const allergen = allergenKey as AllergenType;
    const contains = new Set(recipe.allergenInfo.contains);
    const mayContain = new Set(recipe.allergenInfo.mayContain);

    if (isContained) {
      contains.add(allergen);
      mayContain.delete(allergen);
    } else {
      contains.delete(allergen);
    }

    onChange({
      allergenInfo: {
        ...recipe.allergenInfo,
        contains: Array.from(contains),
        mayContain: Array.from(mayContain)
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Allergen Warning Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">Allergen Control</h3>
          <p className="text-sm text-gray-400">
            Manage allergen information and cross-contamination risks
          </p>
        </div>
      </div>

      {/* Ingredient Allergens */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-400" />
          Contains
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recipe.allergenInfo.contains.map((allergen) => (
            <div key={allergen} className="flex items-center gap-2">
              <AllergenBadge type={allergen} showLabel />
            </div>
          ))}
        </div>
      </div>

      {/* Cross Contact Risks */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Cross-Contact Notes
        </h4>
        <textarea
          value={recipe.allergenInfo.crossContactRisk.join('\n')}
          onChange={(e) => {
            const notes = e.target.value.split('\n').filter(note => note.trim());
            onChange({
              allergenInfo: {
                ...recipe.allergenInfo,
                crossContactRisk: notes
              }
            });
          }}
          className="input w-full h-32"
          placeholder="Enter cross-contact risk notes here..."
        />
      </div>

      {/* Allergen Selector */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">Update Allergens</h4>
        <AllergenSelector
          ingredient={{
            allergenPeanut: recipe.allergenInfo.contains.includes('peanut'),
            allergenCrustacean: recipe.allergenInfo.contains.includes('crustacean'),
            allergenTreenut: recipe.allergenInfo.contains.includes('treenut'),
            allergenShellfish: recipe.allergenInfo.contains.includes('shellfish'),
            allergenSesame: recipe.allergenInfo.contains.includes('sesame'),
            allergenSoy: recipe.allergenInfo.contains.includes('soy'),
            allergenFish: recipe.allergenInfo.contains.includes('fish'),
            allergenWheat: recipe.allergenInfo.contains.includes('wheat'),
            allergenMilk: recipe.allergenInfo.contains.includes('milk'),
            allergenSulphite: recipe.allergenInfo.contains.includes('sulphite'),
            allergenEgg: recipe.allergenInfo.contains.includes('egg'),
            allergenGluten: recipe.allergenInfo.contains.includes('gluten'),
            allergenMustard: recipe.allergenInfo.contains.includes('mustard'),
            allergenCelery: recipe.allergenInfo.contains.includes('celery'),
            allergenGarlic: recipe.allergenInfo.contains.includes('garlic'),
            allergenOnion: recipe.allergenInfo.contains.includes('onion'),
            allergenNitrite: recipe.allergenInfo.contains.includes('nitrite'),
            allergenMushroom: recipe.allergenInfo.contains.includes('mushroom'),
            allergenHotPepper: recipe.allergenInfo.contains.includes('hot_pepper'),
            allergenCitrus: recipe.allergenInfo.contains.includes('citrus'),
            allergenPork: recipe.allergenInfo.contains.includes('pork')
          }}
          onChange={(updates) => {
            Object.entries(updates).forEach(([key, value]) => {
              const allergen = key.replace('allergen', '').toLowerCase() as AllergenType;
              handleAllergenChange(allergen, value as boolean);
            });
          }}
        />
      </div>

      {/* Allergen Warnings */}
      {(recipe.allergenInfo.contains.length > 0 || recipe.allergenInfo.crossContactRisk.length > 0) && (
        <div className="bg-rose-500/10 rounded-lg p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-rose-400 font-medium">Required Allergen Warnings</p>
              <div className="mt-2 space-y-2">
                {recipe.allergenInfo.contains.length > 0 && (
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Contains:</span>{' '}
                    {recipe.allergenInfo.contains.join(', ')}
                  </p>
                )}
                {recipe.allergenInfo.crossContactRisk.length > 0 && (
                  <div className="text-sm text-gray-300">
                    <span className="font-medium">Cross-Contact Risk Notes:</span>
                    {recipe.allergenInfo.crossContactRisk.map((note, index) => (
                      <p key={index} className="ml-4">• {note}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};