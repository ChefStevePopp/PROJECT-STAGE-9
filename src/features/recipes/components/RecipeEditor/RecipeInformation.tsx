import React, { useEffect } from 'react';
import { Package } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
import { useOperationsStore } from '@/stores/operationsStore';
import toast from 'react-hot-toast';

interface BasicInformationProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  recipe,
  onChange,
}) => {
  const {
    groups,
    categories,
    subCategories,
    fetchGroups,
    fetchCategories,
    fetchSubCategories,
    isLoading,
    error,
  } = useFoodRelationshipsStore();

  const { settings, fetchSettings } = useOperationsStore();

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchGroups(), fetchSettings()]);

        // If we have a major group, fetch its categories
        if (recipe.majorGroup) {
          await fetchCategories(recipe.majorGroup);
        }

        // If we have a category, fetch its sub-categories
        if (recipe.category) {
          await fetchSubCategories(recipe.category);
        }
      } catch (err) {
        console.error('Error loading food relationships:', err);
        toast.error('Failed to load categories');
      }
    };

    loadData();
  }, [
    fetchGroups,
    fetchSettings,
    fetchCategories,
    fetchSubCategories,
    recipe.majorGroup,
    recipe.category,
  ]);

  // Fetch categories when major group changes
  useEffect(() => {
    if (recipe.majorGroup) {
      fetchCategories(recipe.majorGroup);
    }
  }, [recipe.majorGroup, fetchCategories]);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (recipe.category) {
      fetchSubCategories(recipe.category);
    }
  }, [recipe.category, fetchSubCategories]);

  const handleMajorGroupChange = async (groupId: string) => {
    // Clear lower-level selections
    onChange({
      majorGroup: groupId || null,
      category: null,
      subCategory: null,
    });

    // Fetch categories for new group if one is selected
    if (groupId) {
      await fetchCategories(groupId);
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    // Clear sub-category selection
    onChange({
      category: categoryId || null,
      subCategory: null,
    });

    // Fetch sub-categories for new category if one is selected
    if (categoryId) {
      await fetchSubCategories(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-400">
          Error loading categories. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-white">Basic Information</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Recipe Name
          </label>
          <input
            type="text"
            value={recipe.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="input w-full"
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
            onChange={(e) =>
              onChange({ type: e.target.value as 'prepared' | 'final' })
            }
            className="input w-full"
            required
          >
            <option value="prepared">Prepared Item</option>
            <option value="final">Final Plate</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Description
        </label>
        <textarea
          value={recipe.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="input w-full h-24"
          placeholder="Enter recipe description"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Major Group
          </label>
          <select
            value={recipe.majorGroup || ''}
            onChange={(e) => handleMajorGroupChange(e.target.value)}
            className="input w-full"
            required
          >
            <option value="">Select major group...</option>
            {groups.map((group) => (
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
            className="input w-full"
            required
            disabled={!recipe.majorGroup}
          >
            <option value="">Select category...</option>
            {categories
              .filter((cat) => cat.groupId === recipe.majorGroup)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Sub-Category
          </label>
          <select
            value={recipe.subCategory || ''}
            onChange={(e) => onChange({ subCategory: e.target.value })}
            className="input w-full"
            disabled={!recipe.category}
          >
            <option value="">Select sub-category...</option>
            {subCategories
              .filter((sub) => sub.categoryId === recipe.category)
              .map((subCategory) => (
                <option key={subCategory.id} value={subCategory.id}>
                  {subCategory.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Recipe Unit Ratio
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={recipe.recipeUnitRatio}
              onChange={(e) => onChange({ recipeUnitRatio: e.target.value })}
              className="input flex-1"
              placeholder="e.g., 4 servings"
              required
            />
            <select
              value={recipe.unitType}
              onChange={(e) => onChange({ unitType: e.target.value })}
              className="input w-32"
              required
            >
              <option value="servings">servings</option>
              <option value="portions">portions</option>
              <option value="pieces">pieces</option>
              <option value="g">grams</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">liters</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Station
          </label>
          <select
            value={recipe.station}
            onChange={(e) => onChange({ station: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select station...</option>
            {settings?.kitchen_stations?.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
