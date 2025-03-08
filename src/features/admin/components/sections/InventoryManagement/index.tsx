import React, { useState, useEffect } from "react";
import {
  Package,
  Upload,
  Trash2,
  Download,
  Settings,
  FileSpreadsheet,
  Calendar,
  Clock,
  DollarSign,
  BarChart3,
  Filter,
} from "lucide-react";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { ExcelDataGrid } from "@/shared/components/ExcelDataGrid";
import { ImportExcelModal } from "@/features/admin/components/ImportExcelModal";
import { WelcomeScreen } from "./WelcomeScreen";
import { CategoryStats } from "./CategoryStats";
import { inventoryColumns } from "./columns";
import { LoadingLogo } from "@/features/shared/components";
import { generateInventoryTemplate } from "@/utils/excel";
import { InventoryReview } from "./InventoryReview";
import toast from "react-hot-toast";

export const InventoryManagement: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [inventoryType, setInventoryType] = useState<"physical" | "prepared">(
    "physical",
  );
  const [inventoryFrequency, setInventoryFrequency] = useState<
    "weekly" | "biweekly" | "monthly" | "quarterly" | "annually"
  >("weekly");
  const [countMethod, setCountMethod] = useState<
    "full" | "partial" | "spot-check"
  >("full");
  const [valuationMethod, setValuationMethod] = useState<
    "fifo" | "lifo" | "weighted-average"
  >("fifo");
  const [showZeroItems, setShowZeroItems] = useState(true);
  const [groupByLocation, setGroupByLocation] = useState(false);
  const [showVariance, setShowVariance] = useState(true);
  const [autoCalculateUsage, setAutoCalculateUsage] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "settings" | "review" | "history" | "config"
  >("settings");

  const {
    items,
    isLoading: isLoadingInventory,
    error: inventoryError,
    fetchItems,
    clearItems,
    importItems,
  } = useInventoryStore();

  const {
    ingredients: masterIngredients,
    isLoading: isLoadingIngredients,
    error: ingredientsError,
    fetchIngredients,
  } = useMasterIngredientsStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchItems(), fetchIngredients()]);
      } catch (error) {
        console.error("Error loading data:", error);
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
        toast.error("Failed to import data");
      }
    }
  };

  const handleClearData = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all inventory data? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await clearItems();
    } catch (error) {
      toast.error("Failed to clear inventory data");
    }
  };

  const handleDownloadTemplate = () => {
    try {
      generateInventoryTemplate();
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error generating template:", error);
      toast.error("Failed to generate template");
    }
  };

  const handleApproveInventory = () => {
    // Logic to approve inventory
    console.log("Approving inventory...");
    setActiveTab("settings");
    toast.success("Inventory approved successfully");
  };

  const handleRejectInventory = () => {
    // Logic to reject inventory
    console.log("Rejecting inventory...");
    setActiveTab("settings");
    toast.error("Inventory rejected");
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

  // Show welcome screen if no items exist and we're on settings tab
  if ((!items || items.length === 0) && activeTab === "settings") {
    return (
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("settings")}
            className={`tab primary ${activeTab === "settings" ? "active" : ""}`}
          >
            <Package className="w-5 h-5 mr-2" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`tab green ${activeTab === "review" ? "active" : ""}`}
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Review Counts
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`tab amber ${activeTab === "history" ? "active" : ""}`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Inventory History
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`tab rose ${activeTab === "config" ? "active" : ""}`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
        </div>

        <WelcomeScreen
          onImport={() => setIsImportModalOpen(true)}
          onDownloadTemplate={handleDownloadTemplate}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("settings")}
          className={`tab primary ${activeTab === "settings" ? "active" : ""}`}
        >
          <Package
            className={`w-5 h-5 mr-2 ${activeTab === "settings" ? "text-primary-400" : "text-gray-400"}`}
          />
          Inventory
        </button>
        <button
          onClick={() => setActiveTab("review")}
          className={`tab green ${activeTab === "review" ? "active" : ""}`}
        >
          <FileSpreadsheet
            className={`w-5 h-5 mr-2 ${activeTab === "review" ? "text-green-400" : ""}`}
          />
          Review Counts
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`tab amber ${activeTab === "history" ? "active" : ""}`}
        >
          <Calendar
            className={`w-5 h-5 mr-2 ${activeTab === "history" ? "text-amber-400" : ""}`}
          />
          Inventory History
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`tab rose ${activeTab === "config" ? "active" : ""}`}
        >
          <Settings
            className={`w-5 h-5 mr-2 ${activeTab === "config" ? "text-rose-400" : ""}`}
          />
          Settings
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "settings" && (
        <>
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Food Inventory
              </h1>
              <p className="text-gray-400">
                Track and manage your current inventory levels
              </p>
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
                className="btn-primary bg-primary-400 hover:bg-amber-600"
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
        </>
      )}

      {activeTab === "review" && (
        <InventoryReview
          onApprove={handleApproveInventory}
          onReject={handleRejectInventory}
        />
      )}

      {activeTab === "history" && (
        <div className="space-y-6">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Inventory History
              </h1>
              <p className="text-gray-400">
                View past inventory counts and trends
              </p>
            </div>
            <div className="flex gap-4">
              <button className="btn-ghost">
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </button>
              <button className="btn-primary">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </button>
            </div>
          </header>

          {/* History placeholder */}
          <div className="bg-gray-800/50 rounded-lg p-6 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Inventory History
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Historical inventory data will be displayed here. Complete your
              first inventory count to see the history.
            </p>
          </div>
        </div>
      )}

      {activeTab === "config" && (
        <div className="space-y-6">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Inventory Settings
              </h1>
              <p className="text-gray-400">
                Configure inventory counting preferences
              </p>
            </div>
          </header>

          {/* Inventory Configuration Panel */}
          <div className="card p-6 bg-gray-800/50">
            <h2 className="text-xl font-bold text-white mb-4">
              Inventory Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Inventory Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Inventory Type
                </label>
                <select
                  className="input w-full"
                  value={inventoryType}
                  onChange={(e) =>
                    setInventoryType(e.target.value as "physical" | "prepared")
                  }
                >
                  <option value="physical">Physical Inventory</option>
                  <option value="prepared">Prepared Items</option>
                </select>
              </div>

              {/* Inventory Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Count Frequency
                </label>
                <select
                  className="input w-full"
                  value={inventoryFrequency}
                  onChange={(e) => setInventoryFrequency(e.target.value as any)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>

              {/* Count Method */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Count Method
                </label>
                <select
                  className="input w-full"
                  value={countMethod}
                  onChange={(e) => setCountMethod(e.target.value as any)}
                >
                  <option value="full">Full Inventory</option>
                  <option value="partial">Partial (By Category)</option>
                  <option value="spot-check">Spot Check</option>
                </select>
              </div>

              {/* Valuation Method */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Valuation Method
                </label>
                <select
                  className="input w-full"
                  value={valuationMethod}
                  onChange={(e) => setValuationMethod(e.target.value as any)}
                >
                  <option value="fifo">FIFO (First In, First Out)</option>
                  <option value="lifo">LIFO (Last In, First Out)</option>
                  <option value="weighted-average">Weighted Average</option>
                </select>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showZeroItems"
                  checked={showZeroItems}
                  onChange={(e) => setShowZeroItems(e.target.checked)}
                  className="mr-2"
                />
                <label
                  htmlFor="showZeroItems"
                  className="text-sm text-gray-300"
                >
                  Show Zero-Quantity Items
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="groupByLocation"
                  checked={groupByLocation}
                  onChange={(e) => setGroupByLocation(e.target.checked)}
                  className="mr-2"
                />
                <label
                  htmlFor="groupByLocation"
                  className="text-sm text-gray-300"
                >
                  Group by Storage Location
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showVariance"
                  checked={showVariance}
                  onChange={(e) => setShowVariance(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showVariance" className="text-sm text-gray-300">
                  Show Variance from Previous
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCalculateUsage"
                  checked={autoCalculateUsage}
                  onChange={(e) => setAutoCalculateUsage(e.target.checked)}
                  className="mr-2"
                />
                <label
                  htmlFor="autoCalculateUsage"
                  className="text-sm text-gray-300"
                >
                  Auto-Calculate Usage
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        type="inventory"
      />
    </div>
  );
};
