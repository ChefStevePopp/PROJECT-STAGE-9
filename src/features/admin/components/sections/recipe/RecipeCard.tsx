import React, { useMemo, useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  Scale, 
  DollarSign, 
  Warehouse,
  AlertTriangle,
  ImageOff
} from 'lucide-react';
import { usePreparedItemsStore } from '@/stores/preparedItemsStore';
import type { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  laborRate?: number;
  className?: string;
}

const LABOR_RATE_PER_HOUR = 30;

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onClick, 
  laborRate = LABOR_RATE_PER_HOUR,
  className = ''
}) => {
  const { items: preparedItems } = usePreparedItemsStore();
  const [imageError, setImageError] = useState(false);

  // Memoize unique categories and stations
  const { uniqueCategories, uniqueStations } = useMemo(() => ({
    uniqueCategories: Array.from(new Set(preparedItems.map(item => item.subCategory))).filter(Boolean),
    uniqueStations: Array.from(new Set(preparedItems.map(item => item.station))).filter(Boolean)
  }), [preparedItems]);

  // Memoize color schemes
  const colorSchemes = useMemo(() => [
    'bg-amber-500/20 text-amber-400 border-amber-500/50',
    'bg-red-500/20 text-red-400 border-red-500/50',
    'bg-green-500/20 text-green-400 border-green-500/50',
    'bg-blue-500/20 text-blue-400 border-blue-500/50',
    'bg-purple-500/20 text-purple-400 border-purple-500/50',
    'bg-pink-500/20 text-pink-400 border-pink-500/50',
    'bg-indigo-500/20 text-indigo-400 border-indigo-500/50',
    'bg-orange-500/20 text-orange-400 border-orange-500/50',
    'bg-cyan-500/20 text-cyan-400 border-cyan-500/50',
    'bg-rose-500/20 text-rose-400 border-rose-500/50'
  ], []);

  // Memoize color getter function
  const getColorForValue = useMemo(() => (value: string, type: 'category' | 'station') => {
    const collection = type === 'category' ? uniqueCategories : uniqueStations;
    const index = collection.indexOf(value);
    return index >= 0 ? colorSchemes[index % colorSchemes.length] : colorSchemes[0];
  }, [uniqueCategories, uniqueStations, colorSchemes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const totalTime = recipe.prepTime + recipe.cookTime;
  const laborCost = (totalTime / 60) * laborRate;

  const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${className}`}>
      {children}
    </span>
  );

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-all duration-200 
                 shadow-lg hover:shadow-xl relative group overflow-hidden border border-gray-700/50 ${className}`}
      aria-label={`Recipe card for ${recipe.name}`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/50 to-transparent z-10" />
        {!imageError ? (
          <img
            src={recipe.imageUrl || "https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=2000&q=80"}
            alt={recipe.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <ImageOff className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Recipe Type Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1.5 rounded-full bg-gray-900/90 border border-gray-700 flex items-center gap-2">
            <ChefHat className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-medium text-gray-300">
              {recipe.type === 'prepared' ? 'Prep Item' : 'Final Plate'}
            </span>
          </div>
        </div>

        {/* Title & Shelf Life */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-gray-300">{recipe.shelfLife}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Storage Info */}
        <div className="flex items-center gap-2 text-gray-300">
          <Warehouse className="w-4 h-4 text-gray-400" />
          <span className="text-sm">
            {recipe.storageArea} • {recipe.container} ({recipe.containerType})
          </span>
        </div>

        {/* Classification Badges */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-400">Classification</div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getColorForValue(recipe.subCategory, 'category')}>
              {recipe.subCategory}
            </Badge>
            <Badge className={getColorForValue(recipe.station, 'station')}>
              {recipe.station}
            </Badge>
          </div>
        </div>

        {/* Recipe Units & Cost */}
        <div className="flex items-center justify-between border-t border-gray-700/50 pt-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-gray-300">
              {recipe.recipeUnitRatio} {recipe.unitType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-gray-300">
              {formatCurrency(recipe.costPerRatioUnit)}/{recipe.unitType}
            </span>
          </div>
        </div>

        {/* Time & Labor */}
        <div className="flex items-center justify-between border-t border-gray-700/50 pt-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Prep: {totalTime} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-emerald-400">
              Labor: {formatCurrency(laborCost)}
            </span>
          </div>
        </div>

        {/* Allergens */}
        {recipe.allergens.length > 0 && (
          <div className="pt-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Contains:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {recipe.allergens.map(allergen => (
                <span
                  key={allergen}
                  className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

export default RecipeCard;