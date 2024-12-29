import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle,
  Box, Tags, Package, Info, Download, Upload
} from 'lucide-react';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
import { ImportFoodRelationshipsModal } from '../ImportFoodRelationshipsModal';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { DiagnosticText } from './DiagnosticText';
import { generateFoodRelationshipsTemplate } from '@/utils/excel';
import toast from 'react-hot-toast';

export const FoodRelationshipsManager: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string, value: string, description?: string } | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const { 
    groups, 
    categories, 
    subCategories, 
    isLoading, 
    error,
    fetchGroups,
    fetchCategories,
    fetchSubCategories,
    addGroup,
    updateGroup,
    deleteGroup,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory
  } = useFoodRelationshipsStore();

  // Initial data fetch
  useEffect(() => {
    console.log('Initial fetch of groups');
    fetchGroups();
  }, [fetchGroups]);

  // Fetch categories when group changes
  useEffect(() => {
    if (selectedGroup) {
      console.log('Selected group changed:', selectedGroup);
      fetchCategories(selectedGroup);
      setSelectedCategory(null); // Reset category selection
    }
  }, [selectedGroup, fetchCategories]);

  // Fetch sub-categories when category changes
  useEffect(() => {
    if (selectedCategory) {
      console.log('Selected category changed:', selectedCategory);
      fetchSubCategories(selectedCategory);
    }
  }, [selectedCategory, fetchSubCategories]);

  const handleAddGroup = async () => {
    if (!newItemName.trim()) return;

    try {
      await addGroup({
        name: newItemName.trim(),
        description: newItemDescription.trim(),
        icon: 'Box',
        color: 'primary',
        sortOrder: groups.length
      });
      setNewItemName('');
      setNewItemDescription('');
      setIsAddingGroup(false);
      await fetchGroups(); // Refresh groups after adding
    } catch (error) {
      console.error('Error adding major group:', error);
      toast.error('Failed to add major group');
    }
  };

  const handleAddCategory = async () => {
    if (!newItemName.trim() || !selectedGroup) return;

    try {
      await addCategory({
        groupId: selectedGroup,
        name: newItemName.trim(),
        description: newItemDescription.trim(),
        sortOrder: categories.length
      });
      setNewItemName('');
      setNewItemDescription('');
      setIsAddingCategory(false);
      if (selectedGroup) {
        await fetchCategories(selectedGroup); // Refresh categories after adding
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleAddSubCategory = async () => {
    if (!newItemName.trim() || !selectedCategory) return;

    try {
      await addSubCategory({
        categoryId: selectedCategory,
        name: newItemName.trim(),
        description: newItemDescription.trim(),
        sortOrder: subCategories.length
      });
      setNewItemName('');
      setNewItemDescription('');
      setIsAddingSubCategory(false);
      if (selectedCategory) {
        await fetchSubCategories(selectedCategory); // Refresh sub-categories after adding
      }
    } catch (error) {
      console.error('Error adding sub-category:', error);
      toast.error('Failed to add sub-category');
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      if (selectedCategory) {
        await updateSubCategory(editingItem.id, { 
          name: editingItem.value,
          description: editingItem.description 
        });
        if (selectedCategory) {
          await fetchSubCategories(selectedCategory);
        }
      } else if (selectedGroup) {
        await updateCategory(editingItem.id, { 
          name: editingItem.value,
          description: editingItem.description 
        });
        if (selectedGroup) {
          await fetchCategories(selectedGroup);
        }
      } else {
        await updateGroup(editingItem.id, { 
          name: editingItem.value,
          description: editingItem.description 
        });
        await fetchGroups();
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (id: string, type: 'group' | 'category' | 'subcategory') => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    try {
      switch (type) {
        case 'group':
          await deleteGroup(id);
          if (selectedGroup === id) {
            setSelectedGroup(null);
            setSelectedCategory(null);
          }
          await fetchGroups();
          break;
        case 'category':
          await deleteCategory(id);
          if (selectedCategory === id) {
            setSelectedCategory(null);
          }
          if (selectedGroup) {
            await fetchCategories(selectedGroup);
          }
          break;
        case 'subcategory':
          await deleteSubCategory(id);
          if (selectedCategory) {
            await fetchSubCategories(selectedCategory);
          }
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const handleMoveItem = async (id: string, direction: 'up' | 'down', type: 'group' | 'category' | 'subcategory') => {
    const items = type === 'group' ? groups 
                : type === 'category' ? categories 
                : subCategories;
    
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    try {
      const updates = {
        sortOrder: items[newIndex].sortOrder
      };

      switch (type) {
        case 'group':
          await updateGroup(id, updates);
          await fetchGroups();
          break;
        case 'category':
          await updateCategory(id, updates);
          if (selectedGroup) {
            await fetchCategories(selectedGroup);
          }
          break;
        case 'subcategory':
          await updateSubCategory(id, updates);
          if (selectedCategory) {
            await fetchSubCategories(selectedCategory);
          }
          break;
      }
    } catch (error) {
      console.error('Error moving item:', error);
      toast.error('Failed to move item');
    }
  };

  const handleDownloadTemplate = () => {
    try {
      generateFoodRelationshipsTemplate();
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchGroups} />;
  }

  return (
    <div className="space-y-6">
      <DiagnosticText />

      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold text-white mb-2">Food Relationships</h1>
    <p className="text-gray-400 mt-1">Taxonomy and Relationships of Food Products</p>
    <p className="text-gray-500 mt-2 text-sm">
      Organize and manage your restaurant's consumable products through a clear hierarchy of 
      Major Groups, Categories, and Sub-Categories. This system streamlines inventory, cost control, 
      and operational flow by defining relationships between raw ingredients, prepared components, 
      and final goods.
    </p>
  </div>
  <div className="flex gap-4 lg:mt-0 mt-4">
    <button
      onClick={handleDownloadTemplate}
      className="btn-ghost text-blue-400 hover:text-blue-300"
    >
      <Download className="w-5 h-5 mr-2" />
      Download Template
    </button>
    <button
      onClick={() => setIsImportModalOpen(true)}
      className="btn-primary"
    >
      <Upload className="w-5 h-5 mr-2" />
      Import Excel
    </button>
  </div>
</header>



<div className="grid grid-cols-3 gap-6 card p-6">
        {/* Major Groups */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Major Groups</h3>
            <button
              onClick={() => setIsAddingGroup(true)}
              className="btn-ghost text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </button>
          </div>

          {isAddingGroup && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="space-y-4">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter group name"
                  autoFocus
                />
                <textarea
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="input w-full"
                  placeholder="Description (optional)"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingGroup(false)}
                    className="btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    className="btn-primary text-sm"
                    disabled={!newItemName}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Group
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {groups.map((group, index) => {
              const Icon = {
                Box,
                Tags,
                Package
              }[group.icon as keyof typeof Box] || Box;

              return (
                <div
                  key={group.id}
                  className={`p-3 rounded-lg transition-colors group ${
                    selectedGroup === group.id
                      ? 'bg-gray-700'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${group.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 text-${group.color}-400`} />
                    </div>
                    {editingItem?.id === group.id ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={editingItem.value}
                          onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                          className="input w-full"
                          autoFocus
                        />
                        <textarea
                          value={editingItem.description || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                          className="input w-full h-20"
                          placeholder="Enter description (optional)"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleUpdateItem}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <button
                            onClick={() => {
                              console.log('Setting selected group:', group.id);
                              setSelectedGroup(group.id);
                              setSelectedCategory(null);
                            }}
                            className="text-white font-medium text-left block w-full"
                          >
                            {group.name}
                          </button>
                          {group.description && (
                            <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                          )}
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {index > 0 && (
                            <button
                              onClick={() => handleMoveItem(group.id, 'up', 'group')}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <ArrowUpCircle className="w-4 h-4" />
                            </button>
                          )}
                          {index < groups.length - 1 && (
                            <button
                              onClick={() => handleMoveItem(group.id, 'down', 'group')}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <ArrowDownCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingItem({ 
                              id: group.id, 
                              value: group.name,
                              description: group.description 
                            })}
                            className="text-gray-400 hover:text-primary-400 p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(group.id, 'group')}
                            className="text-gray-400 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Categories</h3>
            {selectedGroup && (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="btn-ghost text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            )}
          </div>

          {!selectedGroup ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Major Group</h3>
              <p className="text-gray-400 max-w-md">
                Choose a major group from the left to view and manage its categories
              </p>
            </div>
          ) : (
            <>
              {isAddingCategory && (
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter category name"
                      autoFocus
                    />
                    <textarea
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      className="input w-full"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewItemName('');
                          setNewItemDescription('');
                        }}
                        className="btn-ghost text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCategory}
                        className="btn-primary text-sm"
                        disabled={!newItemName}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Category
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {categories
                  .filter(cat => {
                    console.log({
                      category: cat,
                      groupId: cat.groupId,
                      selectedGroup,
                      match: cat.groupId === selectedGroup
                    });
                    return cat.groupId === selectedGroup;
                  })
                  .map((category, index) => (
                    <div
                      key={category.id}
                      className={`p-4 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-gray-700'
                          : 'bg-gray-800/50 hover:bg-gray-700/50'
                      }`}
                    >
                      {editingItem?.id === category.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            className="input w-full"
                            autoFocus
                          />
                          <textarea
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="input w-full h-20"
                            placeholder="Enter description (optional)"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleUpdateItem}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-gray-400 hover:text-gray-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <button
                              onClick={() => setSelectedCategory(category.id)}
                              className="text-white font-medium text-left block w-full"
                            >
                              {category.name}
                            </button>
                            {category.description && (
                              <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {index > 0 && (
                              <button
                                onClick={() => handleMoveItem(category.id, 'up', 'category')}
                                className="text-gray-400 hover:text-white"
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </button>
                            )}
                            {index < categories.length - 1 && (
                              <button
                                onClick={() => handleMoveItem(category.id, 'down', 'category')}
                                className="text-gray-400 hover:text-white"
                              >
                                <ArrowDownCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setEditingItem({ 
                                id: category.id, 
                                value: category.name,
                                description: category.description 
                              })}
                              className="text-gray-400 hover:text-primary-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(category.id, 'category')}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Sub-Categories */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Sub-Categories</h3>
            {selectedCategory && (
              <button
                onClick={() => setIsAddingSubCategory(true)}
                className="btn-ghost text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Sub-Category
              </button>
            )}
          </div>

          {!selectedCategory ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Category</h3>
              <p className="text-gray-400 max-w-md">
                Choose a category from the middle column to view and manage its sub-categories
              </p>
            </div>
          ) : (
            <>
              {isAddingSubCategory && (
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="input w-full"
                      placeholder="Enter sub-category name"
                      autoFocus
                    />
                    <textarea
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      className="input w-full"
                      placeholder="Description (optional)"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsAddingSubCategory(false);
                          setNewItemName('');
                          setNewItemDescription('');
                        }}
                        className="btn-ghost text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddSubCategory}
                        className="btn-primary text-sm"
                        disabled={!newItemName}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Sub-Category
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {subCategories
                  .filter(sub => sub.categoryId === selectedCategory)
                  .map((subCategory, index) => (
                    <div
                      key={subCategory.id}
                      className="p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    >
                      {editingItem?.id === subCategory.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            className="input w-full"
                            autoFocus
                          />
                          <textarea
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                            className="input w-full h-20"
                            placeholder="Enter description (optional)"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleUpdateItem}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-gray-400 hover:text-gray-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-white font-medium">{subCategory.name}</span>
                            {subCategory.description && (
                              <p className="text-sm text-gray-400 mt-1">{subCategory.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {index > 0 && (
                              <button
                                onClick={() => handleMoveItem(subCategory.id, 'up', 'subcategory')}
                                className="text-gray-400 hover:text-white"
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </button>
                            )}
                            {index < subCategories.length - 1 && (
                              <button
                                onClick={() => handleMoveItem(subCategory.id, 'down', 'subcategory')}
                                className="text-gray-400 hover:text-white"
                              >
                                <ArrowDownCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setEditingItem({ 
                                id: subCategory.id, 
                                value: subCategory.name,
                                description: subCategory.description 
                              })}
                              className="text-gray-400 hover:text-primary-400"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(subCategory.id, 'subcategory')}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ImportFoodRelationshipsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};