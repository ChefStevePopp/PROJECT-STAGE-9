import React from 'react';
import { Package, PieChart } from 'lucide-react';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
import type { MasterIngredient } from '@/types/master-ingredient';

interface CategoryStatsProps {
  masterIngredients: MasterIngredient[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
}

// Define color palette for dynamic assignment
const COLOR_PALETTE = [
  { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  { bg: 'bg-green-500/20', text: 'text-green-400' },
  { bg: 'bg-red-500/20', text: 'text-red-400' },
  { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400' }
];

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  masterIngredients,
  selectedCategories,
  onToggleCategory
}) => {
  const { groups } = useFoodRelationshipsStore();

  // Calculate category stats
  const categoryStats = React.useMemo(() => {
    if (!masterIngredients || masterIngredients.length === 0) return [];
    
    // First get category counts by major group
    const stats = masterIngredients.reduce((acc, item) => {
      // Find the group name from the ID
      const group = groups.find(g => g.id === item.majorGroup);
      const category = group?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort categories by count in descending order
    const sortedCategories = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count], index) => ({
        category,
        count,
        selected: selectedCategories.includes(category),
        ...COLOR_PALETTE[index % COLOR_PALETTE.length]
      }));

    return sortedCategories;
  }, [masterIngredients, selectedCategories, groups]);

  // Calculate total items from selected categories
  const totalSelectedItems = React.useMemo(() => {
    if (selectedCategories.length === 0) return masterIngredients.length;
    return categoryStats
      .filter(stat => selectedCategories.includes(stat.category))
      .reduce((sum, stat) => sum + stat.count, 0);
  }, [categoryStats, selectedCategories, masterIngredients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono col-span-full">
        src/features/admin/components/sections/recipe/MasterIngredientList/CategoryStats.tsx
      </div>

      {categoryStats.map(({ category, count, selected, bg, text }) => (
        <div 
          key={category} 
          className="card p-6 cursor-pointer transition-all hover:bg-gray-800/50"
          onClick={() => onToggleCategory(category)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Package className={`w-6 h-6 ${text}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">{category}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded bg-gray-800 flex items-center justify-center ${selected ? 'bg-primary-500/20' : ''}`}>
              {selected && <Package className="w-4 h-4 text-primary-400" />}
            </div>
          </div>
        </div>
      ))}

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-orange/20 flex items-center justify-center">
            <PieChart className="w-6 h-6 text-accent-orange" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Items</p>
            <p className="text-2xl font-bold text-white">{totalSelectedItems}</p>
          </div>
        </div>
      </div>
    </div>
  );
};