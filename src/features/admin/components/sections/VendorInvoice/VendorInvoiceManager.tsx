import React, { useState } from 'react';
import {
  UploadCloud,
  DollarSign,
  TrendingUp,
  Save,
  AlertTriangle,
  Search,
  SlidersHorizontal,
  ListFilter,
} from 'lucide-react';

// Local imports now from same directory
import { QuickStatCard } from './QuickStatCard.tsx';
import { PriceChangeCard } from './PriceChangeCard.tsx';
import { CodeChangesLIst } from './CodeChangesList.tsx';

// App imports
import { useVendorInvoice } from '@/hooks/useVendorInvoice';
import { ImportExcelModal } from '@/features/admin/components/ImportExcelModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useOperationsStore } from '@/stores/operationsStore';
import toast from 'react-hot-toast';

export const VendorInvoiceManager: React.FC = () => {
  // State and hooks
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { settings } = useOperationsStore();
  const {
    selectedVendor,
    setSelectedVendor,
    priceChanges,
    codeChanges,
    searchTerm,
    setSearchTerm,
    quickFilters,
    setQuickFilters,
    filteredChanges,
    stats,
    handleInvoiceImport,
  } = useVendorInvoice();

  // Handlers
  const handleSaveUpdates = async () => {
    try {
      // TODO: Implement batch save
      toast.success('Changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const approveChange = async (ingredientId: string) => {
    try {
      // TODO: Implement approval
      toast.success('Change approved');
    } catch (error) {
      toast.error('Failed to approve change');
    }
  };

  const rejectChange = async (ingredientId: string) => {
    try {
      // TODO: Implement rejection
      toast.success('Change rejected');
    } catch (error) {
      toast.error('Failed to reject change');
    }
  };

  const showPriceHistory = (ingredientId: string) => {
    // TODO: Implement price history modal
  };

  const handleUpdateItemCode = async (change: any) => {
    try {
      // TODO: Implement code update
      toast.success('Item code updated');
    } catch (error) {
      toast.error('Failed to update item code');
    }
  };

  const handleCreateNewItem = async (change: any) => {
    try {
      // TODO: Implement new item creation
      toast.success('New item created');
    } catch (error) {
      toast.error('Failed to create new item');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Top Bar - Quick Actions */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              {/* Left: Vendor Selection & Import */}
              <div className="flex items-center gap-4">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="input bg-gray-800 min-w-[200px]"
                  required
                >
                  <option value="">Select Vendor</option>
                  {settings?.vendors?.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="btn-primary h-10"
                  disabled={!selectedVendor}
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Import Invoice
                </button>
              </div>

              {/* Right: Search & Filters */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 bg-gray-800"
                  />
                </div>

                <button
                  className={`btn-ghost ${
                    quickFilters.significantChanges
                      ? 'text-amber-400'
                      : 'text-gray-400'
                  }`}
                  onClick={() =>
                    setQuickFilters((prev) => ({
                      ...prev,
                      significantChanges: !prev.significantChanges,
                    }))
                  }
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Major Changes
                </button>

                <button
                  className={`btn-ghost ${
                    quickFilters.unmatched ? 'text-rose-400' : 'text-gray-400'
                  }`}
                  onClick={() =>
                    setQuickFilters((prev) => ({
                      ...prev,
                      unmatched: !prev.unmatched,
                    }))
                  }
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Unmatched
                </button>

                <button className="btn-ghost text-gray-400">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  More Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickStatCard
                title="Items to Update"
                value={stats.itemsToUpdate}
                trend={`+${stats.lastInvoiceComparison} from last invoice`}
                icon={<ListFilter className="w-6 h-6 text-blue-400" />}
                color="blue"
              />
              <QuickStatCard
                title="Average Change"
                value={`${stats.averageChange.toFixed(1)}%`}
                trend={
                  stats.unusualChanges
                    ? `${stats.unusualChanges} unusual changes`
                    : undefined
                }
                icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}
                color="emerald"
              />
              <QuickStatCard
                title="Potential Savings"
                value={stats.potentialSavings}
                trend={`${stats.alternateVendors} items with alternates`}
                icon={<DollarSign className="w-6 h-6 text-purple-400" />}
                color="purple"
              />
              <QuickStatCard
                title="Issues to Resolve"
                value={stats.issueCount}
                trend="Code changes & unmatched items"
                icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
                color="amber"
              />
            </div>

            {/* Price Changes Section */}
            {filteredChanges.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Price Changes</h2>
                  <button onClick={handleSaveUpdates} className="btn-primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save All Changes
                  </button>
                </div>

                <div className="grid gap-4">
                  {filteredChanges.map((change) => (
                    <PriceChangeCard
                      key={change.ingredientId}
                      change={change}
                      onApprove={() => approveChange(change.ingredientId)}
                      onReject={() => rejectChange(change.ingredientId)}
                      showHistory={() => showPriceHistory(change.ingredientId)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Code Changes Section */}
            {codeChanges.length > 0 && (
              <CodeChangesList
                changes={codeChanges}
                onUpdateCode={handleUpdateItemCode}
                onCreateNewItem={handleCreateNewItem}
              />
            )}
          </div>
        </div>

        {/* Modals */}
        <ImportExcelModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleInvoiceImport}
          type="vendor-invoice"
          vendor={selectedVendor}
        />
      </div>
    </ErrorBoundary>
  );
};