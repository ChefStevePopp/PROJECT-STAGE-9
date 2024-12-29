import React, { useState, useMemo } from 'react';
import { UtensilsCrossed, Upload, Trash2, PieChart, Save } from 'lucide-react';
import { usePreparedItemsStore } from '@/stores/preparedItemsStore';
import { ExcelDataGrid, LoadingLogo } from '@/features/shared/components';
import { ImportPreparedItemsModal } from '../ImportPreparedItemsModal';
import type { ExcelColumn } from '@/shared/types';
import toast from 'react-hot-toast';

export const PreparedItemsManagement: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { items, isLoading, importItems, clearItems, saveItems } = usePreparedItemsStore();

  // Define columns including all possible allergens
  const columns: ExcelColumn[] = useMemo(() => {
    // Base columns that we know will always exist
    const baseColumns: ExcelColumn[] = [
      { key: 'item_id', name: 'Item ID', type: 'text', width: 100 },
      { key: 'category', name: 'CATEGORY', type: 'text', width: 120 },
      { key: 'product', name: 'PRODUCT', type: 'text', width: 200 },
      { key: 'station', name: 'STATION', type: 'text', width: 120 },
      { key: 'sub_category', name: 'SUB CATEGORY', type: 'text', width: 150 },
      { key: 'storage_area', name: 'STORAGE AREA', type: 'text', width: 150 },
      { key: 'container', name: 'CONTAINER', type: 'text', width: 120 },
      { key: 'container_type', name: 'CONTAINER TYPE', type: 'text', width: 120 },
      { key: 'shelf_life', name: 'SHELF LIFE', type: 'text', width: 120 },
      { key: 'recipe_unit_r_u', name: 'RECIPE UNIT (R/U)', type: 'text', width: 120 },
      { key: 'cost_per_r_u', name: 'COST PER R/U', type: 'currency', width: 120 },
      { key: 'yield_', name: 'YIELD %', type: 'percent', width: 100 },
      { key: 'final_', name: 'FINAL $', type: 'currency', width: 100 }
    ];

    // Define all possible allergen columns
    const allergenColumns: ExcelColumn[] = [
      { key: 'peanuts', name: 'Peanuts', type: 'boolean', width: 80 },
      { key: 'crustaceans', name: 'Crustaceans', type: 'boolean', width: 80 },
      { key: 'treenuts', name: 'Tree Nuts', type: 'boolean', width: 80 },
      { key: 'shellfish', name: 'Shellfish', type: 'boolean', width: 80 },
      { key: 'sesame', name: 'Sesame', type: 'boolean', width: 80 },
      { key: 'soy', name: 'Soy', type: 'boolean', width: 80 },
      { key: 'fish', name: 'Fish', type: 'boolean', width: 80 },
      { key: 'wheat', name: 'Wheat', type: 'boolean', width: 80 },
      { key: 'milk', name: 'Milk', type: 'boolean', width: 80 },
      { key: 'sulphites', name: 'Sulphites', type: 'boolean', width: 80 },
      { key: 'eggs', name: 'Eggs', type: 'boolean', width: 80 },
      { key: 'gluten', name: 'Gluten', type: 'boolean', width: 80 },
      { key: 'mustard', name: 'Mustard', type: 'boolean', width: 80 },
      { key: 'celery', name: 'Celery', type: 'boolean', width: 80 },
      { key: 'garlic', name: 'Garlic', type: 'boolean', width: 80 },
      { key: 'onion', name: 'Onion', type: 'boolean', width: 80 },
      { key: 'nitrites', name: 'Nitrites', type: 'boolean', width: 80 },
      { key: 'mushrooms', name: 'Mushrooms', type: 'boolean', width: 80 },
      { key: 'hot_peppers', name: 'Hot Peppers', type: 'boolean', width: 80 },
      { key: 'citrus', name: 'Citrus', type: 'boolean', width: 80 }
    ];

    return [...baseColumns, ...allergenColumns];
  }, []); // Remove items dependency since columns are now static

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([category, count]) => ({
      category,
      count
    }));
  }, [items]);

  const handleImport = async (data: any[], sheetName: string) => {
    try {
      await importItems(data);
      toast.success('Data imported successfully');
      setIsImportModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import data');
      }
    }
  };

  const handleClearData = () => {
    clearItems();
    toast.success('Data cleared successfully');
  };

  const handleSaveData = async () => {
    try {
      await saveItems();
      toast.success('Data saved successfully');
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  if (isLoading) {
    return <LoadingLogo message="Loading prepared items data..." />;
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Prepared Items Management</h1>
        <div className="flex gap-4">
          <button
            onClick={handleClearData}
            className="btn-ghost text-red-400 hover:text-red-300"
            disabled={items.length === 0}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear Data
          </button>
          <button
            onClick={handleSaveData}
            className="btn-ghost text-green-400 hover:text-green-300"
            disabled={items.length === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Data
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-primary"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Excel Data
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryStats.map(({ category, count }) => (
          <div key={category} className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{category}</p>
                <p className="text-2xl font-bold text-white">{count}</p>
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
              <p className="text-2xl font-bold text-white">{items.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <ExcelDataGrid
          columns={columns}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          type="prepared-items"
        />
      </div>

      <ImportPreparedItemsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};