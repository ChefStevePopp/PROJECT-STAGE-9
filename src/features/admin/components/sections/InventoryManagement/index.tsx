import React, { useState, useEffect } from 'react';
import { Package, Upload, Trash2, Download } from 'lucide-react';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import { ExcelDataGrid } from '@/features/shared/components/ExcelDataGrid';
import { ImportExcelModal } from '@/features/admin/components/ImportExcelModal';
import { WelcomeScreen } from './WelcomeScreen';
import { CategoryStats } from './CategoryStats';
import { inventoryColumns } from './columns';
import { LoadingLogo } from '@/features/shared/components';
import { generateInventoryTemplate } from '@/utils/excel';
import toast from 'react-hot-toast';

export const InventoryManagement: React.FC = () => {
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

  const handleImport = async (data: any[]) => {
    try {
      await importItems(data);
      setIsImportModalOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import data');
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

  const handleDownloadTemplate = () => {
    try {
      generateInventoryTemplate();
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => fetchItems()}
          className="btn-ghost text-primary-400"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show welcome screen if no items exist
  if (!items || items.length === 0) {
    return (
      <WelcomeScreen 
        onImport={() => setIsImportModalOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Food Inventory</h1>
          <p className="text-gray-400">Track and manage your current inventory levels</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="btn-ghost text-amber-400 hover:text-amber-300"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Template
          </button>
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
            className="btn-primary bg-amber-500 hover:bg-amber-600"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Excel
          </button>
        </div>
      </header>

      <CategoryStats
        masterIngredients={masterIngredients}
        selectedCategories={[]}
        onToggleCategory={() => {}}
      />

      <div className="card p-6">
        <ExcelDataGrid
          columns={inventoryColumns}
          data={items}
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