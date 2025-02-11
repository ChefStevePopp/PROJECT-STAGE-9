import React from "react";
import { MasterIngredient } from "@/types/master-ingredient";

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
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-sm text-gray-400">Total Ingredients</div>
        <div className="text-2xl font-bold text-white">{stats.total}</div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-sm text-gray-400">Major Groups</div>
        <div className="text-2xl font-bold text-white">{stats.majorGroups}</div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-sm text-gray-400">Categories</div>
        <div className="text-2xl font-bold text-white">{stats.categories}</div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-4">
        <div className="text-sm text-gray-400">Sub Categories</div>
        <div className="text-2xl font-bold text-white">
          {stats.subCategories}
        </div>
      </div>
    </div>
  );
};
