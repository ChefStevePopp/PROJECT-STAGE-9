import React, { useState } from "react";
import {
  FileSpreadsheet,
  FileText,
  Camera,
  History,
  Settings,
  LineChart,
  Plus,
  Code,
  TrendingUp,
} from "lucide-react";
import { CSVUploader } from "./components/CSVUploader";
import { QuickStatCard } from "./components/QuickStatCard";
import { ImportSettings } from "./components/ImportSettings";
import { PriceHistory } from "./components/PriceHistory";
import { AddInvoiceModal } from "./components/AddInvoiceModal";
import { VendorSelector } from "./components/VendorSelector";
import { PDFUploader } from "./components/PDFUploader";
import { PhotoUploader } from "./components/PhotoUploader";
import { DataPreview } from "./components/DataPreview";
import { MultiCodeManager } from "./components/MultiCodeManager";
import { PriceHistoryView } from "./components/PriceHistoryView";
import { VendorAnalytics } from "./components/VendorAnalytics";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast from "react-hot-toast";

const TABS = [
  {
    id: "dashboard",
    label: "Price History",
    icon: LineChart,
    color: "primary",
  },
  { id: "analytics", label: "Analytics", icon: TrendingUp, color: "blue" },
  { id: "codes", label: "Vendor Codes", icon: Code, color: "purple" },
  {
    id: "import",
    label: "Import Invoices",
    icon: FileSpreadsheet,
    color: "green",
  },
  { id: "history", label: "Import History", icon: History, color: "emerald" },
  { id: "settings", label: "CSV Settings", icon: Settings, color: "slate" },
] as const;

export const VendorInvoiceManager = () => {
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCSVData] = useState<any[] | null>(null);
  const [csvColumns, setCSVColumns] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const { templates, fetchTemplates } = useVendorTemplatesStore();

  // State for import type selection within the Import tab
  const [importType, setImportType] = useState<"csv" | "pdf" | "photo">("csv");

  // Fetch templates whenever vendor changes
  React.useEffect(() => {
    if (selectedVendor) {
      fetchTemplates(selectedVendor);
    }
  }, [selectedVendor, fetchTemplates]);

  const handleUpload = async (data: any[] | File) => {
    if (!selectedVendor) {
      toast.error("Please select a vendor first");
      return;
    }

    // For CSV uploads, check if vendor has a template
    if (!(data instanceof File) && importType === "csv") {
      const vendorTemplate = templates.find(
        (t) => t.vendor_id === selectedVendor,
      );
      if (!vendorTemplate) {
        toast.error(
          <div className="flex flex-col gap-2">
            <span>No CSV template found for this vendor</span>
            <button
              onClick={() => setActiveTab("settings")}
              className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors"
            >
              Set up template
            </button>
          </div>,
          { duration: 5000 },
        );
        return;
      }
    }
    if (data instanceof File) {
      setIsLoading(true);
      try {
        let results;
        if (importType === "pdf") {
          // Mock OCR service for PDF processing
          console.log("Processing PDF file:", data.name);
          // In a real implementation, this would call an actual OCR service
        } else if (importType === "photo") {
          // Mock OCR service for image processing
          console.log("Processing image file:", data.name);
          // In a real implementation, this would call an actual OCR service
        }
      } catch (error) {
        console.error(`Error processing ${importType.toUpperCase()}:`, error);
        toast.error(`Failed to process ${importType.toUpperCase()} file`);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    try {
      // Get the template for this vendor
      const vendorTemplate = templates.find(
        (t) => t.vendor_id === selectedVendor,
      );
      if (!vendorTemplate?.column_mapping) {
        toast.error("Template mapping not found");
        return;
      }

      // Transform the data using the template mapping
      const transformedData = data.map((row) => ({
        item_code: row[vendorTemplate.column_mapping.item_code],
        product_name: row[vendorTemplate.column_mapping.product_name],
        unit_price:
          parseFloat(row[vendorTemplate.column_mapping.unit_price]) || 0,
        unit_of_measure: row[vendorTemplate.column_mapping.unit_of_measure],
      }));

      // Show preview of mapped data
      setCSVData(transformedData);
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Failed to process CSV data");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Vendor Invoice Manager
            </h2>
            <p className="text-gray-400">
              Process vendor invoices and update prices
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddInvoice(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Invoice
            </button>
            {showAddInvoice && (
              <AddInvoiceModal
                isOpen={showAddInvoice}
                onClose={() => setShowAddInvoice(false)}
                onSave={(data) => {
                  console.log("Save invoice:", data);
                  setShowAddInvoice(false);
                }}
              />
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 overflow-visible">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-tab={tab.id}
              className={`tab ${tab.color} whitespace-nowrap ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon
                className={`w-5 h-5 mr-2 flex-shrink-0 ${activeTab === tab.id ? `text-${tab.color}-400` : ""}`}
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Vendor Selection - Only visible for import tab */}
        {activeTab === "import" && (
          <VendorSelector
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            fileType={importType}
            onFileTypeChange={(type) =>
              setImportType(type as "csv" | "pdf" | "photo")
            }
          />
        )}

        {/* Tab Content */}
        <div className="card p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 relative animate-bounce">
                <img
                  src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                  alt="Loading..."
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-gray-400 mt-4">Processing your file...</p>
            </div>
          ) : csvData && activeTab === "import" && importType === "csv" ? (
            <DataPreview
              data={csvData}
              vendorId={selectedVendor}
              onConfirm={() => {
                // Process the mapped data
                console.log("Processing data:", csvData);
                toast.success("Data imported successfully");
                setCSVData(null);
                setSelectedVendor("");
              }}
              onCancel={() => {
                setCSVData(null);
                setSelectedVendor("");
              }}
            />
          ) : (
            <>
              {activeTab === "dashboard" && <PriceHistoryView />}
              {activeTab === "analytics" && <VendorAnalytics />}
              {activeTab === "codes" && <MultiCodeManager />}
              {activeTab === "import" && (
                <>
                  {importType === "csv" && (
                    <CSVUploader
                      onUpload={handleUpload}
                      hasTemplate={templates.some(
                        (t) => t.vendor_id === selectedVendor,
                      )}
                    />
                  )}
                  {importType === "pdf" && (
                    <PDFUploader onUpload={handleUpload} />
                  )}
                  {importType === "photo" && (
                    <PhotoUploader onUpload={handleUpload} />
                  )}
                </>
              )}
              {activeTab === "history" && (
                <div className="text-center py-8 text-gray-400">
                  Import history coming soon...
                </div>
              )}
              {activeTab === "settings" && <ImportSettings />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
