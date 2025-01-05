// src/features/recipes/components/RecipeEditor/utils.ts
const createNewRecipe = (orgId: string): Recipe => ({
  id: `recipe-${Date.now()}`,
  organizationId: orgId,
  type: 'prepared',
  name: '',
  description: '',
  station: '',
  prepTime: 0,
  cookTime: 0,
  recipeUnitRatio: '1',
  unitType: '',
  yield: {
    amount: 0,
    unit: ''
  },
  ingredients: [],
  steps: [],
  notes: '',
  costPerServing: 0,
  lastUpdated: new Date().toISOString(),
  allergenInfo: {
    contains: [],
    mayContain: [],
    crossContactRisk: []
  },
  storage: {
    temperature: {
      value: 40,
      unit: 'F',
      tolerance: 2
    }
  }
});