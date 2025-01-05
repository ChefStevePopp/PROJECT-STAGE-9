import type { Recipe, RecipeIngredient, RecipeStep, RecipeMedia, QualityStandards, RecipeTraining, RecipeVersion, RecipeAllergen } from '../types/recipe';

const DEFAULT_STORAGE = {
  storage_area: '',
  container: '',
  container_type: '',
  shelf_life: '',
};

const DEFAULT_YIELD = {
  amount: 0,
  unit: 'serving',
};

const DEFAULT_ALLERGEN_INFO = {
  contains: [],
  mayContain: [],
  crossContactRisk: [],
};

// Transform ingredient from API
const transformIngredientFromApi = (apiIngredient: any): RecipeIngredient => ({
  id: apiIngredient.id,
  recipe_id: apiIngredient.recipe_id,
  type: apiIngredient.type,
  master_ingredient_id: apiIngredient.master_ingredient_id,
  prepared_recipe_id: apiIngredient.prepared_recipe_id,
  quantity: apiIngredient.quantity,
  unit: apiIngredient.unit,
  cost: apiIngredient.cost,
  notes: apiIngredient.notes,
  sort_order: apiIngredient.sort_order,
});

// Transform step from API
const transformStepFromApi = (apiStep: any): RecipeStep => ({
  id: apiStep.id,
  recipe_id: apiStep.recipe_id,
  instruction: apiStep.instruction,
  warning_level: apiStep.warning_level,
  time_in_minutes: apiStep.time_in_minutes,
  temperature: apiStep.temperature_value ? {
    value: apiStep.temperature_value,
    unit: apiStep.temperature_unit,
  } : undefined,
  is_quality_control_point: apiStep.is_quality_control_point,
  is_critical_control_point: apiStep.is_critical_control_point,
  notes: apiStep.notes,
  sort_order: apiStep.sort_order,
});

export const transformRecipeFromApi = (apiRecipe: any): Recipe => {
  if (!apiRecipe) throw new Error('No recipe data provided');
  
  // Transform ingredients with explicit recipe_id
  const ingredients = apiRecipe.recipe_ingredients?.map(transformIngredientFromApi) || [];

  // Transform steps with explicit recipe_id
  const steps = apiRecipe.recipe_steps?.map(transformStepFromApi) || [];

  // Transform media with explicit recipe_id
  const media = apiRecipe.recipe_media?.map((m: any) => ({
    id: m.id,
    recipe_id: m.recipe_id,
    type: m.type,
    url: m.url,
    title: m.title,
    description: m.description,
    step_id: m.step_id,
    is_primary: m.is_primary,
    tags: m.tags,
    sort_order: m.sort_order,
  })) || [];

  // Transform allergens with explicit recipe_id
  const allergens = apiRecipe.recipe_allergens?.map((a: any) => ({
    id: a.id,
    recipe_id: a.recipe_id,
    allergen_type: a.allergen_type,
    severity: a.severity,
    notes: a.notes,
  })) || [];

  // Transform quality standards
  const qualityStandards = apiRecipe.recipe_quality_standards?.[0] ? {
    id: apiRecipe.recipe_quality_standards[0].id,
    recipe_id: apiRecipe.recipe_quality_standards[0].recipe_id,
    appearance_description: apiRecipe.recipe_quality_standards[0].appearance_description,
    appearance_image_urls: apiRecipe.recipe_quality_standards[0].appearance_image_urls,
    texture_points: apiRecipe.recipe_quality_standards[0].texture_points,
    taste_points: apiRecipe.recipe_quality_standards[0].taste_points,
    aroma_points: apiRecipe.recipe_quality_standards[0].aroma_points,
    plating_instructions: apiRecipe.recipe_quality_standards[0].plating_instructions,
    plating_image_url: apiRecipe.recipe_quality_standards[0].plating_image_url,
    temperature: apiRecipe.recipe_quality_standards[0].temperature_value ? {
      value: apiRecipe.recipe_quality_standards[0].temperature_value,
      unit: apiRecipe.recipe_quality_standards[0].temperature_unit,
      tolerance: apiRecipe.recipe_quality_standards[0].temperature_tolerance,
    } : undefined,
  } : null;

  return {
    id: apiRecipe.id,
    type: apiRecipe.type || 'final',
    status: apiRecipe.status || 'draft',
    name: apiRecipe.name || '',
    description: apiRecipe.description || '',
    major_group: apiRecipe.major_group || '',
    category: apiRecipe.category || '',
    sub_category: apiRecipe.sub_category || '',
    station: apiRecipe.station || '',
    storage_area: apiRecipe.storage_area || DEFAULT_STORAGE.storage_area,
    container: apiRecipe.container || DEFAULT_STORAGE.container,
    container_type: apiRecipe.container_type || DEFAULT_STORAGE.container_type,
    shelf_life: apiRecipe.shelf_life || DEFAULT_STORAGE.shelf_life,
    prep_time: apiRecipe.prep_time || 0,
    cook_time: apiRecipe.cook_time || 0,
    rest_time: apiRecipe.rest_time || 0,
    recipe_unit_ratio: apiRecipe.recipe_unit_ratio || '1',
    unit_type: apiRecipe.unit_type || 'servings',
    yield: {
      amount: apiRecipe.yield_amount || DEFAULT_YIELD.amount,
      unit: apiRecipe.yield_unit || DEFAULT_YIELD.unit,
    },
    ingredients,
    steps,
    media,
    allergens,
    allergenInfo: {
      contains: allergens
        .filter(a => a.severity === 'contains')
        .map(a => a.allergen_type),
      mayContain: allergens
        .filter(a => a.severity === 'may_contain')
        .map(a => a.allergen_type),
      crossContactRisk: allergens
        .filter(a => a.severity === 'cross_contact')
        .map(a => a.allergen_type),
    },
    qualityStandards,
    training: apiRecipe.recipe_training?.[0] || null,
    costPerUnit: apiRecipe.cost_per_unit || 0,
    laborCostPerHour: apiRecipe.labor_cost_per_hour || 0,
    totalCost: apiRecipe.total_cost || 0,
    targetCostPercent: apiRecipe.target_cost_percent || 0,
    imageUrl: apiRecipe.image_url || '',
    videoUrl: apiRecipe.video_url || '',
    version: apiRecipe.version || '1.0',
    versions: apiRecipe.recipe_versions || [],
    lastModified: apiRecipe.updated_at || new Date().toISOString(),
    modifiedBy: apiRecipe.modified_by || '',
    organization_id: apiRecipe.organization_id,
  };
};

export const transformRecipeForApi = (recipe: Partial<Recipe>) => {
  if (!recipe) throw new Error('No recipe data provided');
  
  // Transform ingredients for API
  const recipeIngredients = recipe.ingredients?.map(ingredient => ({
    ...ingredient,
    recipe_id: recipe.id,
    temperature_value: ingredient.temperature?.value,
    temperature_unit: ingredient.temperature?.unit,
  }));

  // Transform steps for API
  const recipeSteps = recipe.steps?.map(step => ({
    ...step,
    recipe_id: recipe.id,
    temperature_value: step.temperature?.value,
    temperature_unit: step.temperature?.unit,
  }));

  return {
    type: recipe.type || 'final',
    status: recipe.status || 'draft',
    name: recipe.name || '',
    description: recipe.description || '',
    major_group: recipe.major_group || '',
    category: recipe.category || '',
    sub_category: recipe.sub_category || '',
    station: recipe.station || '',
    storage_area: recipe.storage_area || '',
    container: recipe.container || '',
    container_type: recipe.container_type || '',
    shelf_life: recipe.shelf_life || '',
    prep_time: recipe.prep_time || 0,
    cook_time: recipe.cook_time || 0,
    rest_time: recipe.rest_time || 0,
    recipe_unit_ratio: recipe.recipe_unit_ratio || '1',
    unit_type: recipe.unit_type || 'servings',
    yield_amount: recipe.yield?.amount || 0,
    yield_unit: recipe.yield?.unit || '',
    cost_per_unit: recipe.costPerUnit || 0,
    labor_cost_per_hour: recipe.laborCostPerHour || 0,
    total_cost: recipe.totalCost || 0,
    target_cost_percent: recipe.targetCostPercent || 0,
    image_url: recipe.imageUrl || '',
    video_url: recipe.videoUrl || '',
    version: recipe.version || '1.0',
    organization_id: recipe.organization_id,
    // Include transformed related entities
    recipe_ingredients: recipeIngredients,
    recipe_steps: recipeSteps,
  };
};