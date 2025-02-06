import React from "react";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import { MasterIngredient } from "@/types/master-ingredient";

export const AllergenCell: React.FC<{ ingredient: MasterIngredient }> = ({
  ingredient,
}) => {
  const allergens = [];

  // Standard allergens
  if (ingredient.allergen_peanut) allergens.push("peanut");
  if (ingredient.allergen_crustacean) allergens.push("crustacean");
  if (ingredient.allergen_treenut) allergens.push("treenut");
  if (ingredient.allergen_shellfish) allergens.push("shellfish");
  if (ingredient.allergen_sesame) allergens.push("sesame");
  if (ingredient.allergen_soy) allergens.push("soy");
  if (ingredient.allergen_fish) allergens.push("fish");
  if (ingredient.allergen_wheat) allergens.push("wheat");
  if (ingredient.allergen_milk) allergens.push("milk");
  if (ingredient.allergen_sulphite) allergens.push("sulphite");
  if (ingredient.allergen_egg) allergens.push("egg");
  if (ingredient.allergen_gluten) allergens.push("gluten");
  if (ingredient.allergen_mustard) allergens.push("mustard");
  if (ingredient.allergen_celery) allergens.push("celery");
  if (ingredient.allergen_garlic) allergens.push("garlic");
  if (ingredient.allergen_onion) allergens.push("onion");
  if (ingredient.allergen_nitrite) allergens.push("nitrite");
  if (ingredient.allergen_mushroom) allergens.push("mushroom");
  if (ingredient.allergen_hot_pepper) allergens.push("hot_pepper");
  if (ingredient.allergen_citrus) allergens.push("citrus");
  if (ingredient.allergen_pork) allergens.push("pork");

  // Custom allergens
  if (ingredient.allergen_custom1_active && ingredient.allergen_custom1_name) {
    allergens.push(ingredient.allergen_custom1_name);
  }
  if (ingredient.allergen_custom2_active && ingredient.allergen_custom2_name) {
    allergens.push(ingredient.allergen_custom2_name);
  }
  if (ingredient.allergen_custom3_active && ingredient.allergen_custom3_name) {
    allergens.push(ingredient.allergen_custom3_name);
  }

  return (
    <div className="flex flex-wrap gap-1">
      {allergens.map((allergen) => (
        <AllergenBadge key={allergen} type={allergen} size="sm" />
      ))}
    </div>
  );
};
