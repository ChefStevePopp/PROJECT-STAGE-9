import { Wine, Coffee, Package, UtensilsCrossed, ShoppingBag, Box } from 'lucide-react';

export const DEFAULT_MAJOR_GROUPS = [
  {
    name: 'Food',
    description: 'All food items including raw ingredients, prepared items, and final dishes',
    icon: 'Package',
    color: 'primary',
    defaultCategories: [
      {
        name: 'Proteins',
        description: 'Meat, poultry, seafood, and other protein sources',
        subCategories: ['Beef', 'Pork', 'Poultry', 'Seafood', 'Plant-Based']
      },
      {
        name: 'Produce',
        description: 'Fresh fruits and vegetables',
        subCategories: ['Vegetables', 'Fruits', 'Herbs', 'Mushrooms']
      },
      {
        name: 'Dairy',
        description: 'Milk products and eggs',
        subCategories: ['Milk', 'Cheese', 'Cream', 'Eggs', 'Butter']
      },
      {
        name: 'Dry Goods',
        description: 'Shelf-stable ingredients and staples',
        subCategories: ['Grains', 'Pasta', 'Beans', 'Rice', 'Flour']
      },
      {
        name: 'Spices & Seasonings',
        description: 'Herbs, spices, and seasoning blends',
        subCategories: ['Whole Spices', 'Ground Spices', 'Salt & Pepper', 'Seasoning Blends']
      }
    ]
  },
  {
    name: 'Beverage',
    description: 'Non-alcoholic beverages including soft drinks, coffee, tea, and juices',
    icon: 'Coffee',
    color: 'amber',
    defaultCategories: [
      {
        name: 'Hot Beverages',
        description: 'Coffee, tea, and hot chocolate',
        subCategories: ['Coffee', 'Tea', 'Hot Chocolate', 'Specialty']
      },
      {
        name: 'Cold Beverages',
        description: 'Soft drinks, juices, and water',
        subCategories: ['Sodas', 'Juices', 'Water', 'Energy Drinks']
      },
      {
        name: 'Mixers',
        description: 'Non-alcoholic cocktail ingredients',
        subCategories: ['Syrups', 'Sodas', 'Juices', 'Garnishes']
      }
    ]
  },
  {
    name: 'Alcohol',
    description: 'Alcoholic beverages including beer, wine, and spirits',
    icon: 'Wine',
    color: 'rose',
    defaultCategories: [
      {
        name: 'Beer',
        description: 'Draft, bottled, and canned beers',
        subCategories: ['Draft Beer', 'Bottled Beer', 'Craft Beer', 'Import Beer']
      },
      {
        name: 'Wine',
        description: 'Red, white, and sparkling wines',
        subCategories: ['Red Wine', 'White Wine', 'Sparkling', 'Rosé']
      },
      {
        name: 'Spirits',
        description: 'Liquors and distilled beverages',
        subCategories: ['Whiskey', 'Vodka', 'Gin', 'Rum', 'Tequila']
      }
    ]
  },
  {
    name: 'Prepared Items',
    description: 'House-made components and prepared ingredients',
    icon: 'UtensilsCrossed',
    color: 'green',
    defaultCategories: [
      {
        name: 'Sauces',
        description: 'House-made sauces and dressings',
        subCategories: ['Hot Sauces', 'Dressings', 'Marinades', 'Compound Butters']
      },
      {
        name: 'Prep Items',
        description: 'Pre-prepared ingredients',
        subCategories: ['Cut Vegetables', 'Portioned Proteins', 'Stocks', 'Bases']
      },
      {
        name: 'Components',
        description: 'Recipe components and mise en place',
        subCategories: ['Garnishes', 'Toppings', 'Fillings', 'Sides']
      }
    ]
  },
  {
    name: 'Retail',
    description: 'Items available for retail sale',
    icon: 'ShoppingBag',
    color: 'purple',
    defaultCategories: [
      {
        name: 'Merchandise',
        description: 'Branded merchandise and apparel',
        subCategories: ['Apparel', 'Drinkware', 'Accessories', 'Gift Cards']
      },
      {
        name: 'Packaged Foods',
        description: 'House-made items for retail',
        subCategories: ['Sauces', 'Seasonings', 'Snacks', 'Meal Kits']
      }
    ]
  },
  {
    name: 'Supplies',
    description: 'Non-food items required for operations',
    icon: 'Box',
    color: 'blue',
    defaultCategories: [
      {
        name: 'Disposables',
        description: 'Single-use items and packaging',
        subCategories: ['To-Go Containers', 'Utensils', 'Napkins', 'Bags']
      },
      {
        name: 'Cleaning',
        description: 'Cleaning supplies and chemicals',
        subCategories: ['Chemicals', 'Paper Products', 'Equipment', 'Tools']
      },
      {
        name: 'Kitchen',
        description: 'Kitchen supplies and small equipment',
        subCategories: ['Tools', 'Storage', 'Safety', 'Maintenance']
      }
    ]
  }
] as const;

export type MajorGroup = typeof DEFAULT_MAJOR_GROUPS[number];
export type Category = typeof DEFAULT_MAJOR_GROUPS[number]['defaultCategories'][number];