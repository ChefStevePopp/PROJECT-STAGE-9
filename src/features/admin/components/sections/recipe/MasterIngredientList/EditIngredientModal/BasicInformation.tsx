import React from 'react';
import { Package } from 'lucide-react';
import type { MasterIngredient } from '@/types/master-ingredient';
import { useFoodCategories } from '@/hooks/useFoodCategories';
import type { OperationsSettings } from '@/types/operations';

interface BasicInformationProps {
  formData: MasterIngredient;
  settings: OperationsSettings | null;
  onChange: (updates: MasterIngredient) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  settings,
  onChange
}) => {
  const {
    groups,
    categories,
    subCategories,
    selectedGroup,
    selectedCategory,
    selectedSubCategory,
    isLoading,
    error
  } = useFoodCategories(formData.majorGroup, formData.category);

  const handleMajorGroupChange = (groupId: string) => {
    onChange({
      ...formData,
      majorGroup: groupId,
      majorGroupName: groups.find(g => g.id === groupId)?.name || '',
      category: '',
      categoryName: '',
      subCategory: '',
      subCategoryName: ''
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    onChange({
      ...formData,
      category: categoryId,
      categoryName: categories.find(c => c.id === categoryId)?.name || '',
      subCategory: '',
      subCategoryName: ''
    });
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    onChange({
      ...formData,
      subCategory: subCategoryId,
      subCategoryName: subCategories.find(s => s.id === subCategoryId)?.name || ''
    });
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-red-400">Error loading categories: {error}</div>;
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
            Vendor Code | Bar Code
          </label>
          <input
            type="text"
            value={formData.itemCode}
            onChange={(e) => onChange({ ...formData, itemCode: e.target.value })}
            className="input w-full bg-gray-800/50"
            placeholder="Enter vendor or bar code"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Product Name
          </label>
          <input
            type="text"
            value={formData.product}
            onChange={(e) => onChange({ ...formData, product: e.target.value })}
            className="input w-full bg-gray-800/50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Major Group
          </label>
          <select
            value={formData.majorGroup || ''}
            onChange={(e) => handleMajorGroupChange(e.target.value)}
            className="input w-full bg-gray-800/50"
            required
          >
            <option value="">Select major group...</option>
            {groups.map(group => (
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
            value={formData.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input w-full bg-gray-800/50"
            required
            disabled={!formData.majorGroup}
          >
            <option value="">Select category...</option>
            {categories.map(category => (
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
            value={formData.subCategory || ''}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
            className="input w-full bg-gray-800/50"
            disabled={!formData.category}
          >
            <option value="">Select sub-category...</option>
            {subCategories.map(subCategory => (
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
            Vendor
          </label>
          <select
            value={formData.vendor}
            onChange={(e) => onChange({ ...formData, vendor: e.target.value })}
            className="input w-full bg-gray-800/50"
            required
          >
            <option value="">Select vendor...</option>
            {settings?.vendors?.map(vendor => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Storage Area
          </label>
          <select
            value={formData.storageArea}
            onChange={(e) => onChange({ ...formData, storageArea: e.target.value })}
            className="input w-full bg-gray-800/50"
            required
          >
            <option value="">Select storage area...</option>
            {settings?.storage_areas?.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
