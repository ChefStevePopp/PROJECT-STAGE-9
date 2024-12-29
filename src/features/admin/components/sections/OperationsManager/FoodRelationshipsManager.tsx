import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, AlertTriangle,
  ArrowUpCircle, ArrowDownCircle,
  Box, Tags, Package, Info, Download, Upload
} from 'lucide-react';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
import { generateFoodRelationshipsTemplate } from '@/utils/excel';
import { ImportFoodRelationshipsModal } from '../ImportFoodRelationshipsModal';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { DiagnosticText } from './DiagnosticText';
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

  useEffect(() => {
    console.log('Selected Group:', selectedGroup);
    console.log('Categories:', categories);
  }, [selectedGroup, categories]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedGroup) {
      console.log('Fetching categories for group:', selectedGroup);
      fetchCategories(selectedGroup);
    } else {
      setSelectedCategory(null);
    }
  }, [selectedGroup, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    }
  }, [selectedCategory, fetchSubCategories]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchGroups} />;
  }

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
    } catch (error) {
      console.error('Error adding group:', error);
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
    } catch (error) {
      console.error('Error adding category:', error);
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
    } catch (error) {
      console.error('Error adding subcategory:', error);
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
      } else if (selectedGroup) {
        await updateCategory(editingItem.id, {
          name: editingItem.value,
          description: editingItem.description
        });
      } else {
        await updateGroup(editingItem.id, {
          name: editingItem.value,
          description: editingItem.description
        });
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (id: string, type: 'group' | 'category' | 'subcategory') => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      switch (type) {
        case 'group':
          await deleteGroup(id);
          if (selectedGroup === id) {
            setSelectedGroup(null);
            setSelectedCategory(null);
          }
          break;
        case 'category':
          await deleteCategory(id);
          if (selectedCategory === id) {
            setSelectedCategory(null);
          }
          break;
        case 'subcategory':
          await deleteSubCategory(id);
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
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
          break;
        case 'category':
          await updateCategory(id, updates);
          break;
        case 'subcategory':
          await updateSubCategory(id, updates);
          break;
      }
    } catch (error) {
      console.error('Error moving item:', error);
    }
  };

  return (
    <div className="space-y-6">
      <DiagnosticText />

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Operations Manager</h1>
          <p className="text-gray-400">Configure system-wide lookup values and master lists</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => generateFoodRelationshipsTemplate()}
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

      <div className="grid grid-cols-3 gap-6">
        {/* Groups Column */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Groups</h3>
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
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {groups.map((group, index) => (
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
                    {group.icon === 'Box' && <Box className={`w-4 h-4 text-${group.color}-400`} />}
                    {group.icon === 'Tags' && <Tags className={`w-4 h-4 text-${group.color}-400`} />}
                    {group.icon === 'Package' && <Package className={`w-4 h-4 text-${group.color}-400`} />}
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
                        className="input w-full"
                        placeholder="Description (optional)"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="btn-ghost text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateItem}
                          className="btn-primary text-sm"
                        >
                          Save
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
            ))}
          </div>
        </div>

        {/* Categories Column */}
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
              <h3 className="text-lg font-medium text-white mb-2">Select a Group</h3>
              <p className="text-gray-400 max-w-md">
                Choose a group from the left to view and manage its categories
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
                      onChange={(e) => setNewItemName(e.target.value         type="text"
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
                       Save
                     </button>
                   </div>
                 </div>
               </div>
             )}

             <div className="space-y-2">
               {categories
                 .filter(cat => cat.groupId === selectedGroup)
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
                           className="input w-full"
                           placeholder="Description (optional)"
                           rows={2}
                         />
                         <div className="flex justify-end gap-2">
                           <button
                             onClick={() => setEditingItem(null)}
                             className="btn-ghost text-sm"
                           >
                             Cancel
                           </button>
                           <button
                             onClick={handleUpdateItem}
                             className="btn-primary text-sm"
                           >
                             Save
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

       {/* Sub-Categories Column */}
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
                     placeholder="Enter subcategory name"
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
                       Save
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
                           className="input w-full"
                           placeholder="Description (optional)"
                           rows={2}
                         />
                         <div className="flex justify-end gap-2">
                           <button
                             onClick={() => setEditingItem(null)}
                             className="btn-ghost text-sm"
                           >
                             Cancel
                           </button>
                           <button
                             onClick={handleUpdateItem}
                             className="btn-primary text-sm"
                           >
                             Save
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
}