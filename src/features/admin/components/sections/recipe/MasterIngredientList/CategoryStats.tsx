import React from "react";
import { MasterIngredient } from "@/types/master-ingredient";
import { Package, Layers, FolderTree, Grid3X3 } from "lucide-react";

interface CategoryStatsProps {
  ingredients: MasterIngredient[];
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  ingredients,
}) => {
  const stats = React.useMemo(() => {
    const majorGroups = new Set(ingredients.map((i) => i.major_group));
    const categories = new Set(ingredients.map((i) => i.category));
    const subCategories = new Set(ingredients.map((i) => i.sub_category));

    return {
      total: ingredients.length,
      majorGroups: majorGroups.size,
      categories: categories.size,
      subCategories: subCategories.size,
    };
  }, [ingredients]);

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-400">Total Ingredients</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-400">Major Groups</div>
            <div className="text-2xl font-bold text-white">
              {stats.majorGroups}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <FolderTree className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-400">Categories</div>
            <div className="text-2xl font-bold text-white">
              {stats.categories}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Grid3X3 className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 text-center">
            <div className="text-sm text-gray-400">Sub Categories</div>
            <div className="text-2xl font-bold text-white">
              {stats.subCategories}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
