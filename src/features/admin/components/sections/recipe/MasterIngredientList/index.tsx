import React, { useState, useEffect } from 'react';
import { Package, Plus, Upload, Trash2, PieChart, Save, Download } from 'lucide-react';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import { ExcelDataGrid } from '@/features/shared/components/ExcelDataGrid';
import { ImportExcelModal } from '../../../ImportExcelModal';
import { EditIngredientModal } from './EditIngredientModal';
import { CreateIngredientModal } from './CreateIngredientModal';
import { CategoryStats } from './CategoryStats';
import { masterIngredientColumns } from './columns';
import { LoadingLogo } from '@/features/shared/components';
import { generateMasterIngredientsTemplate } from '@/utils/excel';
import type { MasterIngredient } from '@/types/master-ingredient';
import toast from 'react-hot-toast';

export const MasterIngredientList: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<MasterIngredient | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const { 
    ingredients, 
    isLoading, 
    error,
    importIngredients, 
    clearIngredients, 
    saveIngredients,
    updateIngredient,
    fetchIngredients 
  } = useMasterIngredientsStore();

  // Fetch ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const handleImport = async (data: any[]) => {
    try {
      await importIngredients(data);
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
    if (!window.confirm('Are you sure you want to clear all master ingredients? This cannot be undone.')) {
      return;
    }

    try {
      await clearIngredients();
    } catch (error) {
      toast.error('Failed to clear data');
    }
  };

  const handleSaveData = async () => {
    try {
      await saveIngredients();
    } catch (error) {
      toast.error('Failed to save data');
    }
  };

  const handleDownloadTemplate = () => {
    try {
      generateMasterIngredientsTemplate();
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error generating template:', error);
      toast.error('Failed to generate template');
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredIngredients = React.useMemo(() => {
    return ingredients.filter(item => 
      selectedCategories.length === 0 || selectedCategories.includes(item.majorGroupName || 'Uncategorized')
    );
  }, [ingredients, selectedCategories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingLogo message="Loading master ingredients..." />
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
          onClick={() => fetchIngredients()}
          className="btn-ghost text-primary-400"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/recipe/MasterIngredientList/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Master Ingredients</h1>
          <p className="text-gray-400">Manage your master ingredient list and recipe units</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleClearData}
            className="btn-ghost-red"
            disabled={ingredients.length === 0}
          >
            <Trash2 className="w-5 h-5" />
            Clear Data
          </button>
          <button
            onClick={handleSaveData}
            className="btn-ghost-green"
            disabled={ingredients.length === 0}
          >
            <Save className="w-5 h-5" />
            Save Data
          </button>
          <button
            onClick={handleDownloadTemplate}
            className="btn-ghost-blue"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary"
          >
            <Upload className="w-5 h-5" />
            Import Excel
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Ingredient
          </button>
        </div>
      </header>

      <CategoryStats
        masterIngredients={ingredients}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
      />

      <div className="card p-6">
        <ExcelDataGrid
          columns={masterIngredientColumns}
          data={filteredIngredients}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          type="master-ingredients"
          onRowClick={setEditingIngredient}
        />
      </div>

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        type="master-ingredients"
      />

      {isCreateModalOpen && (
        <CreateIngredientModal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {editingIngredient && (
        <EditIngredientModal
          isOpen={true}
          onClose={() => setEditingIngredient(null)}
          ingredient={editingIngredient}
          onSave={updateIngredient}
        />
      )}
    </div>
  );
};