import { type AllergenType } from './types';

export const ALLERGENS = {
  peanut: {
    type: 'peanut' as AllergenType,
    label: 'Peanuts',
    icon: 'Nut',
    color: 'orange',
    severity: 'high',
    description: 'Common in sauces, desserts, and Asian cuisine'
  },
  crustacean: {
    type: 'crustacean' as AllergenType,
    label: 'Crustaceans',
    icon: 'Shell',
    color: 'red',
    severity: 'high',
    description: 'Includes shrimp, crab, and lobster'
  },
  treenut: {
    type: 'treenut' as AllergenType,
    label: 'Tree Nuts',
    icon: 'Nut',
    color: 'amber',
    severity: 'high',
    description: 'Includes almonds, walnuts, and pecans'
  },
  shellfish: {
    type: 'shellfish' as AllergenType,
    label: 'Shellfish',
    icon: 'Shell',
    color: 'pink',
    severity: 'high',
    description: 'Includes mussels, clams, and oysters'
  },
  sesame: {
    type: 'sesame' as AllergenType,
    label: 'Sesame',
    icon: 'CircleDot',
    color: 'yellow',
    severity: 'high',
    description: 'Common in oils, seeds, and Asian cuisine'
  },
  soy: {
    type: 'soy' as AllergenType,
    label: 'Soy',
    icon: 'Leaf',
    color: 'green',
    severity: 'medium',
    description: 'Common in Asian cuisine and processed foods'
  },
  fish: {
    type: 'fish' as AllergenType,
    label: 'Fish',
    icon: 'Fish',
    color: 'blue',
    severity: 'high',
    description: 'All types of finned fish'
  },
  wheat: {
    type: 'wheat' as AllergenType,
    label: 'Wheat',
    icon: 'Wheat',
    color: 'amber',
    severity: 'medium',
    description: 'Common in breads, pastas, and baked goods'
  },
  milk: {
    type: 'milk' as AllergenType,
    label: 'Dairy',
    icon: 'Milk',
    color: 'cyan',
    severity: 'medium',
    description: 'Includes milk, cheese, and dairy products'
  },
  sulphite: {
    type: 'sulphite' as AllergenType,
    label: 'Sulphites',
    icon: 'AlertTriangle',
    color: 'purple',
    severity: 'medium',
    description: 'Common in dried fruits and wine'
  },
  egg: {
    type: 'egg' as AllergenType,
    label: 'Eggs',
    icon: 'Egg',
    color: 'yellow',
    severity: 'medium',
    description: 'Both egg whites and yolks'
  },
  gluten: {
    type: 'gluten' as AllergenType,
    label: 'Gluten',
    icon: 'Wheat',
    color: 'amber',
    severity: 'medium',
    description: 'Found in wheat, rye, and barley'
  },
  mustard: {
    type: 'mustard' as AllergenType,
    label: 'Mustard',
    icon: 'AlertTriangle',
    color: 'yellow',
    severity: 'medium',
    description: 'Includes mustard seeds and prepared mustard'
  },
  celery: {
    type: 'celery' as AllergenType,
    label: 'Celery',
    icon: 'Leaf',
    color: 'emerald',
    severity: 'low',
    description: 'Includes celery stalks, leaves, and seeds'
  },
  garlic: {
    type: 'garlic' as AllergenType,
    label: 'Garlic',
    icon: 'AlertTriangle',
    color: 'indigo',
    severity: 'low',
    description: 'Common seasoning in many cuisines'
  },
  onion: {
    type: 'onion' as AllergenType,
    label: 'Onion',
    icon: 'AlertTriangle',
    color: 'red',
    severity: 'low',
    description: 'All varieties of onions'
  },
  nitrite: {
    type: 'nitrite' as AllergenType,
    label: 'Nitrites',
    icon: 'AlertTriangle',
    color: 'fuchsia',
    severity: 'low',
    description: 'Common in cured and processed meats'
  },
  mushroom: {
    type: 'mushroom' as AllergenType,
    label: 'Mushrooms',
    icon: 'AlertTriangle',
    color: 'stone',
    severity: 'low',
    description: 'All varieties of mushrooms'
  },
  hot_pepper: {
    type: 'hot_pepper' as AllergenType,
    label: 'Hot Peppers',
    icon: 'Flame',
    color: 'red',
    severity: 'low',
    description: 'Includes chili peppers and spicy ingredients'
  },
  citrus: {
    type: 'citrus' as AllergenType,
    label: 'Citrus',
    icon: 'Citrus',
    color: 'orange',
    severity: 'low',
    description: 'Includes lemons, limes, oranges, and grapefruits'
  },
  pork: {
    type: 'pork' as AllergenType,
    label: 'Pork',
    icon: 'AlertTriangle',
    color: 'rose',
    severity: 'medium',
    description: 'All pork products'
  }
} as const;

// Database column mapping
export const ALLERGEN_COLUMNS = Object.fromEntries(
  Object.keys(ALLERGENS).map(key => [key, `allergen_${key}`])
) as Record<AllergenType, string>;

// Severity levels for styling
export const SEVERITY_COLORS = {
  high: 'red',
  medium: 'yellow',
  low: 'blue'
} as const;

// Helper functions
export function getAllergenInfo(type: AllergenType) {
  return ALLERGENS[type];
}

export function getAllergenTypes(): AllergenType[] {
  return Object.keys(ALLERGENS) as AllergenType[];
}

export function getAllergensByCategory(severity: 'high' | 'medium' | 'low'): AllergenType[] {
  return getAllergenTypes().filter(type => ALLERGENS[type].severity === severity);
}