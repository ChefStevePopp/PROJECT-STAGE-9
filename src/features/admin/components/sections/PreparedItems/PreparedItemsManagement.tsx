import React, { useState, useMemo, useEffect } from 'react';
import { UtensilsCrossed, Upload, Trash2, PieChart, Save } from 'lucide-react';
import { usePreparedItemsStore } from '@/stores/preparedItemsStore';
import { ExcelDataGrid } from '@/features/shared/components/ExcelDataGrid';
import { ImportExcelModal } from '@/features/admin/components/ImportExcelModal';
import { preparedItemColumns } from './columns';
import toast from 'react-hot-toast';

// Define a rich color palette for dynamic assignment
const COLOR_PALETTE = [
  { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  { bg: 'bg-green-500/20', text: 'text-green-400' },
  { bg: 'bg-red-500/20', text: 'text-red-400' },
  { bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400' },
  { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  { bg: 'bg-violet-500/20', text: 'text-violet-400' },
  { bg: 'bg-lime-500/20', text: 'text-lime-400' },
  { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  { bg: 'bg-sky-500/20', text: 'text-sky-400' },
  { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  { bg: 'bg-primary-500/20', text: 'text-primary-400' },
  { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  { bg: 'bg-zinc-500/20', text: 'text-zinc-400' }
];

export const PreparedItemsManagement: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { items, isLoading, importItems, clearItems, saveItems, fetchItems } = usePreparedItemsStore();

  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Calculate sub-category stats and assign colors dynamically
  const { subCategoryStats, subCategoryColors } = useMemo(() => {
    // First get sub-category counts
    const stats = items.reduce((acc, item) => {
      const subCategory = item.subCategory || 'Uncategorized';
      acc[subCategory] = (acc[subCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort sub-categories by count in descending order
    const sortedSubCategories = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .map(([subCategory, count]) => ({ subCategory, count }));

    // Create color mapping for sub-categories
    const colors = sortedSubCategories.reduce((acc, { subCategory }, index) => {
      acc[subCategory] = COLOR_PALETTE[index % COLOR_PALETTE.length];
      return acc;
    }, {} as Record<string, { bg: string; text: string }>);

    return {
      subCategoryStats: sortedSubCategories,
      subCategoryColors: colors
    };
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

  const handleClearData = async () => {
    try {
      await clearItems();
      toast.success('Data cleared successfully');
    } catch (error) {
      toast.error('Failed to clear data');
    }
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <UtensilsCrossed className="w-12 h-12 text-primary-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading prepared items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/PreparedItems/PreparedItemsManagement.tsx
      </div>

      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Prepared Items</h1>
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
            Import Excel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subCategoryStats.map(({ subCategory, count }) => {
          const { bg, text } = subCategoryColors[subCategory];
          return (
            <div key={subCategory} className="card p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <UtensilsCrossed className={`w-6 h-6 ${text}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{subCategory}</p>
                  <p className="text-2xl font-bold text-white">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
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
          columns={preparedItemColumns}
          data={items}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          type="prepared-items"
        />
      </div>

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        type="prepared-items"
      />
    </div>
  );
};