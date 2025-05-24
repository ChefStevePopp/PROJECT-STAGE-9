import React, { useEffect, useState } from "react";
import { AlertTriangle, Info, Shield } from "lucide-react";
import { AllergenSelector } from "@/features/allergens/components/AllergenSelector";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import type { Recipe } from "../../types/recipe";
import type { AllergenType } from "@/features/allergens/types";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useRecipeStore } from "@/stores/recipeStore";

interface AllergenControlProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
  masterIngredients?: any[]; // Master ingredients with allergen information
}

// Function to convert from DB format to component format
const extractAllergensFromMasterIngredient = (masterIngredient: any) => {
  if (!masterIngredient) return null;

  const contains: string[] = [];

  // Check each allergen boolean field - handle different boolean formats
  if (
    masterIngredient.allergen_peanut === true ||
    masterIngredient.allergen_peanut === "true" ||
    masterIngredient.allergen_peanut === 1
  )
    contains.push("peanut");
  if (
    masterIngredient.allergen_crustacean === true ||
    masterIngredient.allergen_crustacean === "true" ||
    masterIngredient.allergen_crustacean === 1
  )
    contains.push("crustacean");
  if (
    masterIngredient.allergen_treenut === true ||
    masterIngredient.allergen_treenut === "true" ||
    masterIngredient.allergen_treenut === 1
  )
    contains.push("treenut");
  if (
    masterIngredient.allergen_shellfish === true ||
    masterIngredient.allergen_shellfish === "true" ||
    masterIngredient.allergen_shellfish === 1
  )
    contains.push("shellfish");
  if (
    masterIngredient.allergen_sesame === true ||
    masterIngredient.allergen_sesame === "true" ||
    masterIngredient.allergen_sesame === 1
  )
    contains.push("sesame");
  if (
    masterIngredient.allergen_soy === true ||
    masterIngredient.allergen_soy === "true" ||
    masterIngredient.allergen_soy === 1
  )
    contains.push("soy");
  if (
    masterIngredient.allergen_fish === true ||
    masterIngredient.allergen_fish === "true" ||
    masterIngredient.allergen_fish === 1
  )
    contains.push("fish");
  if (
    masterIngredient.allergen_wheat === true ||
    masterIngredient.allergen_wheat === "true" ||
    masterIngredient.allergen_wheat === 1
  )
    contains.push("wheat");
  if (
    masterIngredient.allergen_milk === true ||
    masterIngredient.allergen_milk === "true" ||
    masterIngredient.allergen_milk === 1
  )
    contains.push("milk");
  if (
    masterIngredient.allergen_sulphite === true ||
    masterIngredient.allergen_sulphite === "true" ||
    masterIngredient.allergen_sulphite === 1
  )
    contains.push("sulphite");
  if (
    masterIngredient.allergen_egg === true ||
    masterIngredient.allergen_egg === "true" ||
    masterIngredient.allergen_egg === 1
  )
    contains.push("egg");
  if (
    masterIngredient.allergen_gluten === true ||
    masterIngredient.allergen_gluten === "true" ||
    masterIngredient.allergen_gluten === 1
  )
    contains.push("gluten");
  if (
    masterIngredient.allergen_mustard === true ||
    masterIngredient.allergen_mustard === "true" ||
    masterIngredient.allergen_mustard === 1
  )
    contains.push("mustard");
  if (
    masterIngredient.allergen_celery === true ||
    masterIngredient.allergen_celery === "true" ||
    masterIngredient.allergen_celery === 1
  )
    contains.push("celery");
  if (
    masterIngredient.allergen_garlic === true ||
    masterIngredient.allergen_garlic === "true" ||
    masterIngredient.allergen_garlic === 1
  )
    contains.push("garlic");
  if (
    masterIngredient.allergen_onion === true ||
    masterIngredient.allergen_onion === "true" ||
    masterIngredient.allergen_onion === 1
  )
    contains.push("onion");
  if (
    masterIngredient.allergen_nitrite === true ||
    masterIngredient.allergen_nitrite === "true" ||
    masterIngredient.allergen_nitrite === 1
  )
    contains.push("nitrite");
  if (
    masterIngredient.allergen_mushroom === true ||
    masterIngredient.allergen_mushroom === "true" ||
    masterIngredient.allergen_mushroom === 1
  )
    contains.push("mushroom");
  if (
    masterIngredient.allergen_hot_pepper === true ||
    masterIngredient.allergen_hot_pepper === "true" ||
    masterIngredient.allergen_hot_pepper === 1
  )
    contains.push("hot_pepper");
  if (
    masterIngredient.allergen_citrus === true ||
    masterIngredient.allergen_citrus === "true" ||
    masterIngredient.allergen_citrus === 1
  )
    contains.push("citrus");
  if (
    masterIngredient.allergen_pork === true ||
    masterIngredient.allergen_pork === "true" ||
    masterIngredient.allergen_pork === 1
  )
    contains.push("pork");

  // Add custom allergens if they exist - handle different boolean formats
  if (
    (masterIngredient.allergen_custom1_active === true ||
      masterIngredient.allergen_custom1_active === "true" ||
      masterIngredient.allergen_custom1_active === 1) &&
    masterIngredient.allergen_custom1_name
  ) {
    contains.push(masterIngredient.allergen_custom1_name.toLowerCase());
  }
  if (
    (masterIngredient.allergen_custom2_active === true ||
      masterIngredient.allergen_custom2_active === "true" ||
      masterIngredient.allergen_custom2_active === 1) &&
    masterIngredient.allergen_custom2_name
  ) {
    contains.push(masterIngredient.allergen_custom2_name.toLowerCase());
  }
  if (
    (masterIngredient.allergen_custom3_active === true ||
      masterIngredient.allergen_custom3_active === "true" ||
      masterIngredient.allergen_custom3_active === 1) &&
    masterIngredient.allergen_custom3_name
  ) {
    contains.push(masterIngredient.allergen_custom3_name.toLowerCase());
  }

  return {
    contains,
    mayContain: [], // Since these are direct allergens from the ingredient
    crossContactRisk: [], // We'll use the notes field elsewhere if needed
  };
};

export const AllergenControl: React.FC<AllergenControlProps> = ({
  recipe,
  onChange,
  masterIngredients = [],
}) => {
  // Fetch master ingredients if not provided
  const {
    ingredients,
    fetchIngredients,
    isLoading: isFetchingIngredients,
  } = useMasterIngredientsStore();

  // Fetch recipes to get names for recipe ingredients
  const { recipes, fetchRecipes } = useRecipeStore();
  const [recipeMap, setRecipeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (masterIngredients.length === 0) {
      fetchIngredients();
    }
    fetchRecipes();
  }, [masterIngredients.length, fetchIngredients, fetchRecipes]);

  // Create a map of recipe IDs to names
  useEffect(() => {
    if (recipes.length > 0) {
      const map: Record<string, string> = {};
      recipes.forEach((r) => {
        map[r.id] = r.name;
      });
      setRecipeMap(map);
    }
  }, [recipes]);

  // Debug logging
  useEffect(() => {
    console.log(
      "Recipe ingredients:",
      JSON.stringify(recipe.ingredients, null, 2),
    );
    console.log(
      "Master ingredients count:",
      masterIngredients.length || ingredients.length,
    );

    // Log the first few master ingredients for debugging
    if (ingredients.length > 0) {
      console.log(
        "Sample master ingredients:",
        JSON.stringify(ingredients.slice(0, 3), null, 2),
      );
    }
  }, [recipe.ingredients, masterIngredients.length, ingredients.length]);

  const handleAllergenChange = (allergenKey: string, isContained: boolean) => {
    console.log("Allergen change:", allergenKey, isContained);

    const allergen = allergenKey as AllergenType;
    const contains = new Set(recipe.allergenInfo?.contains || []);
    const mayContain = new Set(recipe.allergenInfo?.mayContain || []);

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
        mayContain: Array.from(mayContain),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Allergen Warning Header with Warnings */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left column: Header */}
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

        {/* Right column: Allergen Warnings with badges */}
        {((recipe.allergenInfo?.contains || []).length > 0 ||
          (recipe.allergenInfo?.crossContactRisk || []).length > 0) && (
          <div className="bg-rose-500/10 rounded-lg p-4">
            {(recipe.allergenInfo?.contains || []).length > 0 && (
              <div>
                <span className="text-sm text-gray-300 font-medium">
                  Contains:
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(recipe.allergenInfo?.contains || []).map((allergen) => (
                    <AllergenBadge
                      key={allergen}
                      type={allergen as AllergenType}
                      size="sm"
                      showLabel
                    />
                  ))}
                </div>
              </div>
            )}
            {(recipe.allergenInfo?.crossContactRisk || []).length > 0 && (
              <div className="mt-2 text-sm text-gray-300">
                <span className="font-medium">Cross-Contact Risk Notes:</span>
                {(recipe.allergenInfo?.crossContactRisk || []).map(
                  (note, index) => (
                    <p key={index} className="ml-4">
                      • {note}
                    </p>
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ingredient Allergens */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-400" />
          Recipe Ingredients
        </h4>

        {/* Debug info */}
        <div className="bg-gray-800/50 p-2 rounded-lg text-xs text-gray-400 mb-2">
          Recipe has {recipe.ingredients?.length || 0} ingredients. Master
          ingredients: {ingredients.length}
          {isFetchingIngredients && (
            <span className="ml-2 text-amber-400">Loading ingredients...</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {recipe.ingredients?.map((ingredient, index) => {
            // Find the corresponding master ingredient
            const masterIngredient = ingredients.find(
              (mi) => mi.id === ingredient.name,
            );

            // Check if this is a recipe ingredient (UUID format)
            const isRecipeIngredient =
              !masterIngredient &&
              ingredient.name &&
              ingredient.name.match(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
              );

            // Get recipe name if this is a recipe ingredient
            const recipeName = isRecipeIngredient
              ? recipeMap[ingredient.name]
              : null;

            // Extract allergens from master ingredient
            const allergenInfo = masterIngredient
              ? extractAllergensFromMasterIngredient(masterIngredient)
              : null;

            // Add to the set of allergens
            if (allergenInfo?.contains) {
              allergenInfo.contains.forEach((allergen) =>
                allergens.add(allergen),
              );
            }

            return (
              <div
                key={index}
                className="bg-gray-800/50 p-3 rounded-lg border border-gray-700"
              >
                <div className="font-medium text-white mb-1">
                  {masterIngredient
                    ? masterIngredient.product
                    : recipeName || // Use recipe name if available
                      ingredient.label || // Then label if available
                      ingredient.commonMeasure || // Then common measure
                      ingredient.name || // Then name
                      "Unnamed Ingredient"}
                </div>

                {/* Display allergens */}
                {((allergenInfo && allergenInfo.contains.length > 0) ||
                  (isRecipeIngredient && recipeAllergens.length > 0)) && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      Allergens:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {allergenInfo &&
                        allergenInfo.contains.map((allergen) => (
                          <AllergenBadge
                            key={allergen}
                            type={allergen as AllergenType}
                            size="sm"
                          />
                        ))}
                      {isRecipeIngredient &&
                        recipeAllergens.map((allergen) => (
                          <AllergenBadge
                            key={`recipe-${allergen}`}
                            type={allergen as AllergenType}
                            size="sm"
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!recipe.ingredients?.length && (
            <div className="text-gray-400 col-span-full">
              No ingredients added to this recipe
            </div>
          )}
        </div>
      </div>

      {/* Allergen Selector */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" />
          Manually Update Allergens
        </h4>
        <p className="text-xs text-gray-400 mb-4">
          Allergens must be manually selected for liability reasons. The
          ingredients above contain the following allergens:
        </p>

        {/* Consolidated list of allergens from ingredients */}
        <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
          <h5 className="text-sm font-medium text-white mb-2">
            Selected Ingredients Contain These Allergens:
          </h5>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredients?.reduce((allergens, ingredient) => {
              // Find the corresponding master ingredient
              const masterIngredient = ingredients.find(
                (mi) => mi.id === ingredient.name,
              );

              // Check if this is a recipe ingredient (UUID format)
              const isRecipeIngredient =
                !masterIngredient &&
                ingredient.name &&
                ingredient.name.match(
                  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
                );

              // Get recipe allergens if this is a recipe ingredient
              if (isRecipeIngredient && recipeMap[ingredient.name]) {
                const recipeAllergens =
                  recipeMap[ingredient.name].allergens || [];
                recipeAllergens.forEach((allergen) => allergens.add(allergen));
              }

              // Extract allergens from master ingredient
              const allergenInfo = masterIngredient
                ? extractAllergensFromMasterIngredient(masterIngredient)
                : null;

              // Add to the set of allergens
              if (allergenInfo?.contains) {
                allergenInfo.contains.forEach((allergen) =>
                  allergens.add(allergen),
                );
              }
              return allergens;
            }, new Set<string>()).size > 0 ? (
              Array.from(
                recipe.ingredients?.reduce((allergens, ingredient) => {
                  // Find the corresponding master ingredient
                  const masterIngredient = ingredients.find(
                    (mi) => mi.id === ingredient.name,
                  );

                  // Check if this is a recipe ingredient (UUID format)
                  const isRecipeIngredient =
                    !masterIngredient &&
                    ingredient.name &&
                    ingredient.name.match(
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
                    );

                  // Get recipe allergens if this is a recipe ingredient
                  if (isRecipeIngredient && recipeMap[ingredient.name]) {
                    const recipeAllergens =
                      recipeMap[ingredient.name].allergens || [];
                    recipeAllergens.forEach((allergen) =>
                      allergens.add(allergen),
                    );
                  }

                  // Extract allergens from master ingredient
                  const allergenInfo = masterIngredient
                    ? extractAllergensFromMasterIngredient(masterIngredient)
                    : null;

                  // Add to the set of allergens
                  if (allergenInfo?.contains) {
                    allergenInfo.contains.forEach((allergen) =>
                      allergens.add(allergen),
                    );
                  }
                  return allergens;
                }, new Set<string>()),
              ).map((allergen) => (
                <AllergenBadge
                  key={allergen}
                  type={allergen as AllergenType}
                  size="md"
                  showLabel
                />
              ))
            ) : (
              <p className="text-gray-400">
                No allergens detected in ingredients
              </p>
            )}
          </div>
        </div>

        <AllergenSelector
          ingredient={{
            allergenPeanut: (recipe.allergenInfo?.contains || []).includes(
              "peanut",
            ),
            allergenCrustacean: (recipe.allergenInfo?.contains || []).includes(
              "crustacean",
            ),
            allergenTreenut: (recipe.allergenInfo?.contains || []).includes(
              "treenut",
            ),
            allergenShellfish: (recipe.allergenInfo?.contains || []).includes(
              "shellfish",
            ),
            allergenSesame: (recipe.allergenInfo?.contains || []).includes(
              "sesame",
            ),
            allergenSoy: (recipe.allergenInfo?.contains || []).includes("soy"),
            allergenFish: (recipe.allergenInfo?.contains || []).includes(
              "fish",
            ),
            allergenWheat: (recipe.allergenInfo?.contains || []).includes(
              "wheat",
            ),
            allergenMilk: (recipe.allergenInfo?.contains || []).includes(
              "milk",
            ),
            allergenSulphite: (recipe.allergenInfo?.contains || []).includes(
              "sulphite",
            ),
            allergenEgg: (recipe.allergenInfo?.contains || []).includes("egg"),
            allergenGluten: (recipe.allergenInfo?.contains || []).includes(
              "gluten",
            ),
            allergenMustard: (recipe.allergenInfo?.contains || []).includes(
              "mustard",
            ),
            allergenCelery: (recipe.allergenInfo?.contains || []).includes(
              "celery",
            ),
            allergenGarlic: (recipe.allergenInfo?.contains || []).includes(
              "garlic",
            ),
            allergenOnion: (recipe.allergenInfo?.contains || []).includes(
              "onion",
            ),
            allergenNitrite: (recipe.allergenInfo?.contains || []).includes(
              "nitrite",
            ),
            allergenMushroom: (recipe.allergenInfo?.contains || []).includes(
              "mushroom",
            ),
            allergenHotPepper: (recipe.allergenInfo?.contains || []).includes(
              "hot_pepper",
            ),
            allergenCitrus: (recipe.allergenInfo?.contains || []).includes(
              "citrus",
            ),
            allergenPork: (recipe.allergenInfo?.contains || []).includes(
              "pork",
            ),
          }}
          onChange={(updates) => {
            Object.entries(updates).forEach(([key, value]) => {
              const allergen = key
                .replace("allergen", "")
                .toLowerCase() as AllergenType;
              handleAllergenChange(allergen, value as boolean);
            });
          }}
        />
      </div>

      {/* Cross Contact Risks */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          Cross-Contamination Notes
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <textarea
              value={(recipe.allergenInfo?.crossContactRisk || []).join("\n")}
              onChange={(e) => {
                const notes = e.target.value
                  .split("\n")
                  .filter((note) => note.trim());
                onChange({
                  allergenInfo: {
                    ...recipe.allergenInfo,
                    crossContactRisk: notes,
                  },
                });
              }}
              className="input w-full h-32"
              placeholder="Enter cross-contamination risk notes here..."
            />
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h5 className="text-sm font-medium text-white mb-2">
              Common Cross-Contamination Notes:
            </h5>
            <ul className="text-xs text-gray-300 space-y-2">
              <li>• Shared equipment with wheat products</li>
              <li>• Processed in a facility that also processes nuts</li>
              <li>
                • May contain traces of milk due to shared processing lines
              </li>
              <li>• Prepared in a kitchen that handles shellfish</li>
              <li>• Potential cross-contact with soy products</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Allergen Warnings section removed - now displayed next to header */}
    </div>
  );
};
