import React, { useState, useMemo, useCallback } from "react";
import {
  Package,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { ImportExcelModal } from "@/features/admin/components/ImportExcelModal";
import { QuickStatCard } from "./QuickStatCard";
import { PriceChangeCard } from "./PriceChangeCard";
import { CodeChangesList } from "./CodeChangeLIst";
import { useVendorInvoice } from "@/hooks/useVendorInvoice";
import type { PriceChange, CodeChange } from "@/types/vendor-invoice";
import toast from "react-hot-toast";

interface StatsCard {
  icon: React.ComponentType;
  title: string;
  value: string | number;
  trend?: string;
  color: "blue" | "emerald" | "purple" | "amber" | "rose";
}

export const VendorInvoiceManager: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  // Memoize stats cards to prevent unnecessary recalculations
  const statsCards: StatsCard[] = useMemo(
    () => [
      {
        icon: Package,
        title: "Items to Update",
        value: stats.itemsToUpdate,
        trend: `${stats.lastInvoiceComparison > 0 ? "+" : ""}${stats.lastInvoiceComparison} from last invoice`,
        color: "blue",
      },
      {
        icon: TrendingUp,
        title: "Average Change",
        value: `${stats.averageChange > 0 ? "+" : ""}${stats.averageChange.toFixed(1)}%`,
        trend: stats.unusualChanges
          ? `${stats.unusualChanges} unusual changes`
          : undefined,
        color: stats.averageChange > 5 ? "rose" : "emerald",
      },
      {
        icon: AlertTriangle,
        title: "Issues",
        value: stats.issueCount,
        trend: stats.potentialSavings
          ? `${stats.potentialSavings} potential savings`
          : undefined,
        color: stats.issueCount > 0 ? "amber" : "emerald",
      },
      {
        icon: Package,
        title: "Alternate Vendors",
        value: stats.alternateVendors || 0,
        trend: "Available for review",
        color: "purple",
      },
    ],
    [stats],
  );

  // Handler functions
  const handleApprovePrice = useCallback(async (change: PriceChange) => {
    try {
      // Implement price change approval logic
      toast.success("Price change approved");
    } catch (error) {
      console.error("Error approving price change:", error);
      toast.error("Failed to approve price change");
    }
  }, []);

  const handleRejectPrice = useCallback(async (change: PriceChange) => {
    try {
      // Implement price change rejection logic
      toast.success("Price change rejected");
    } catch (error) {
      console.error("Error rejecting price change:", error);
      toast.error("Failed to reject price change");
    }
  }, []);

  const handleShowHistory = useCallback(async (ingredientId: string) => {
    try {
      // Implement price history display logic
      // This could open a modal or navigate to a history view
    } catch (error) {
      console.error("Error loading price history:", error);
      toast.error("Failed to load price history");
    }
  }, []);

  const handleUpdateCode = useCallback(async (change: CodeChange) => {
    try {
      // Implement code update logic
      toast.success("Code updated successfully");
    } catch (error) {
      console.error("Error updating code:", error);
      toast.error("Failed to update code");
    }
  }, []);

  const handleCreateNewItem = useCallback(async (change: CodeChange) => {
    try {
      // Implement new item creation logic
      toast.success("New item created successfully");
    } catch (error) {
      console.error("Error creating new item:", error);
      toast.error("Failed to create new item");
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Vendor Invoice Manager
          </h2>
          <p className="text-gray-400 mt-1">
            Review and process vendor price changes
          </p>
        </div>
        <button
          onClick={() => setIsImportModalOpen(true)}
          className="btn-primary"
        >
          <FileSpreadsheet className="w-5 h-5 mr-2" />
          Import Invoice
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <QuickStatCard key={index} {...card} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-800/50 rounded-lg p-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="input w-full max-w-xs"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setQuickFilters((prev) => ({
                ...prev,
                significantChanges: !prev.significantChanges,
              }))
            }
            className={`btn-ghost text-sm ${quickFilters.significantChanges ? "bg-primary-500/20 text-primary-400" : ""}`}
          >
            Significant Changes
          </button>
          <button
            onClick={() =>
              setQuickFilters((prev) => ({
                ...prev,
                codeChanges: !prev.codeChanges,
              }))
            }
            className={`btn-ghost text-sm ${quickFilters.codeChanges ? "bg-primary-500/20 text-primary-400" : ""}`}
          >
            Code Changes
          </button>
          <button
            onClick={() =>
              setQuickFilters((prev) => ({
                ...prev,
                unmatched: !prev.unmatched,
              }))
            }
            className={`btn-ghost text-sm ${quickFilters.unmatched ? "bg-primary-500/20 text-primary-400" : ""}`}
          >
            Unmatched Items
          </button>
        </div>
      </div>

      {/* Price Changes */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Price Changes</h3>
        {filteredChanges.map((change) => (
          <PriceChangeCard
            key={change.ingredientId}
            change={change}
            onApprove={() => handleApprovePrice(change)}
            onReject={() => handleRejectPrice(change)}
            showHistory={() => handleShowHistory(change.ingredientId)}
          />
        ))}
        {filteredChanges.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            No price changes found matching your criteria.
          </p>
        )}
      </div>

      {/* Code Changes */}
      {codeChanges.length > 0 && (
        <CodeChangesList
          changes={codeChanges}
          onUpdateCode={handleUpdateCode}
          onCreateNewItem={handleCreateNewItem}
        />
      )}

      {/* Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleInvoiceImport}
        type="inventory"
      />
    </div>
  );
};
