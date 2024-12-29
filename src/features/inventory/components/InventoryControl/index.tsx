import React, { useState, useEffect, useMemo } from 'react';
import { Package, Plus, Search, Upload, Trash2, PieChart, Save } from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import { ExcelDataGrid } from '@/features/shared/components/ExcelDataGrid';
import { ImportExcelModal } from '../ImportExcelModal';
import { inventoryColumns } from './columns';
import { LoadingLogo } from '@/features/shared/components';
import toast from 'react-hot-toast';

export const InventoryControl: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const { 
    items, 
    isLoading: isLoadingInventory, 
    error: inventoryError,
    fetchItems,
    clearItems,
    importItems
  } = useInventoryStore();

  const {
    ingredients: masterIngredients,
    isLoading: isLoadingIngredients,
    error: ingredientsError,
    fetchIngredients
  } = useMasterIngredientsStore();

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchItems(),
          fetchIngredients()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [fetchItems, fetchIngredients]);

  // Calculate category stats
  const categoryStats = useMemo(() => {
    if (!masterIngredients || masterIngredients.length === 0) return [];
    
    const stats = masterIngredients.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count
      }));
  }, [masterIngredients]);

  const handleImport = async (data: any[]) => {
    try {
      await importItems(data);
      setIsImportModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import inventory data');
      }
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all inventory data? This cannot be undone.')) {
      return;
    }

    try {
      await clearItems();
    } catch (error) {
      toast.error('Failed to clear inventory data');
    }
  };

  const isLoading = isLoadingInventory || isLoadingIngredients;
  const error = inventoryError || ingredientsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingLogo message="Loading inventory data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/inventory/components/InventoryControl/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Food Inventory</h1>
          <p className="text-gray-400">Manage your inventory counts and stock levels</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleClearData}
            className="btn-ghost text-red-400 hover:text-red-300"
            disabled={!items || items.length === 0}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Clear Data
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-primary"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Excel Data
          </button>
          <button
            onClick={() => {}}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Item
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categoryStats.map(({ category, count }) => (
          <div key={category} className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary-400" />
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
              <p className="text-2xl font-bold text-white">{masterIngredients?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <ExcelDataGrid
          columns={inventoryColumns}
          data={items || []}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          type="inventory"
        />
      </div>

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        type="inventory"
      />
    </div>
  );
};