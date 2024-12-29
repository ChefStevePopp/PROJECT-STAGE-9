import React, { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Recipe } from '../../../types/recipe';
import type { OperationsSettings } from '@/types/operations';

interface PrimaryInfoProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
  settings: OperationsSettings;
}

export const PrimaryInfo: React.FC<PrimaryInfoProps> = ({
  recipe,
  onChange,
  settings,
}) => {
  const [majorGroups, setMajorGroups] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // Fetch food relationships data
  useEffect(() => {
    const fetchFoodRelationships = async () => {
      // Fetch major groups
      const { data: majorGroupsData } = await supabase
        .from('food_category_groups')
        .select('*');
      if (majorGroupsData) setMajorGroups(majorGroupsData);

      // Fetch categories for selected major group
      if (recipe.major_group) {
        const { data: categoriesData } = await supabase
          .from('food_categories')
          .select('*')
          .eq('group_id', recipe.major_group);
        if (categoriesData) setCategories(categoriesData);
      }

      // Fetch sub-categories for selected category
      if (recipe.category) {
        const { data: subCategoriesData } = await supabase
          .from('food_sub_categories')
          .select('*')
          .eq('category_id', recipe.category);
        if (subCategoriesData) setSubCategories(subCategoriesData);
      }
    };

    fetchFoodRelationships();
  }, [recipe.major_group, recipe.category]);

  // Handle major group change
  const handleMajorGroupChange = async (groupId: string) => {
    onChange({ 
      major_group: groupId,
      category: '', // Reset dependent fields
      sub_category: '' 
    });
    setCategories([]);
    setSubCategories([]);
  };

  // Handle category change
  const handleCategoryChange = async (categoryId: string) => {
    onChange({ 
      category: categoryId,
      sub_category: '' // Reset dependent field
    });
    setSubCategories([]);
  };

  return (
    <div className="space-y-4">
      {/* ... Header section remains the same ... */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            value={recipe.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="input w-full bg-gray-800/50"
            placeholder="Enter recipe name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Recipe Type
          </label>
          <select
            value={recipe.type}
            onChange={(e) => onChange({ type: e.target.value as 'prepared' | 'final' })}
            className="input w-full bg-gray-800/50"
            required
          >
            <option value="prepared">Prepared Item</option>
            <option value="final">Final Plate</option>
          </select>
        </div>
      </div>

      {/* Classification Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Major Group
          </label>
          <select
            value={recipe.major_group || ''}
            onChange={(e) => handleMajorGroupChange(e.target.value)}
            className="input w-full bg-gray-800/50"
          >
            <option value="">Select Major Group</option>
            {majorGroups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Category
          </label>
          <select
            value={recipe.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input w-full bg-gray-800/50"
            disabled={!recipe.major_group}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Sub Category
          </label>
          <select
            value={recipe.sub_category || ''}
            onChange={(e) => onChange({ sub_category: e.target.value })}
            className="input w-full bg-gray-800/50"
            disabled={!recipe.category}
          >
            <option value="">Select Sub-Category</option>
            {subCategories.map(subCategory => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Station
          </label>
          <input
            type="text"
            value={recipe.station || ''}
            onChange={(e) => onChange({ station: e.target.value })}
            className="input w-full bg-gray-800/50"
            placeholder="e.g., Grill, Prep"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Description
        </label>
        <textarea
          value={recipe.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          className="input w-full h-24 bg-gray-800/50"
          placeholder="Enter a detailed description of the recipe..."
          required
        />
      </div>
    </div>
  );
};