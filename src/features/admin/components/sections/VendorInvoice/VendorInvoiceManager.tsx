import React from "react";
import {
  FileSpreadsheet,
  FileText,
  Camera,
  History,
  Settings,
} from "lucide-react";
import { CSVUploader } from "./components/CSVUploader";
import { QuickStatCard } from "./components/QuickStatCard";
import { ColumnMapper } from "./components/ColumnMapper";
import { VendorSelector } from "./components/VendorSelector";
import { PDFUploader } from "./components/PDFUploader";
import { PhotoUploader } from "./components/PhotoUploader";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import toast from "react-hot-toast";

const TABS = [
  { id: "csv", label: "CSV Import", icon: FileSpreadsheet, color: "primary" },
  { id: "pdf", label: "PDF Import", icon: FileText, color: "rose" },
  { id: "photo", label: "Photo Import", icon: Camera, color: "emerald" },
  { id: "history", label: "Import History", icon: History, color: "amber" },
  { id: "settings", label: "Import Settings", icon: Settings, color: "purple" },
] as const;

export const VendorInvoiceManager = () => {
  const [activeTab, setActiveTab] =
    React.useState<(typeof TABS)[number]["id"]>("csv");
  const [isLoading, setIsLoading] = React.useState(false);
  const [csvData, setCSVData] = React.useState<any[] | null>(null);
  const [csvColumns, setCSVColumns] = React.useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = React.useState("");

  const { templates } = useVendorTemplatesStore();

  const handleUpload = async (data: any[] | File) => {
    if (!selectedVendor) {
      toast.error("Please select a vendor first");
      return;
    }
    if (data instanceof File) {
      setIsLoading(true);
      try {
        let results;
        if (activeTab === "pdf") {
          results = await ocrService.processPDF(data);
        } else if (activeTab === "photo") {
          results = await ocrService.processImage(data);
        }

        if (results) {
          const extractedData = ocrService.extractInvoiceData(results);
          console.log("Extracted data:", extractedData);
          // TODO: Process extracted data
        }
      } catch (error) {
        console.error(`Error processing ${activeTab.toUpperCase()}:`, error);
        toast.error(`Failed to process ${activeTab.toUpperCase()} file`);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    try {
      // Get column headers from first row
      if (data.length > 0) {
        setCSVColumns(Object.keys(data[0]));
        setCSVData(data);
      }
    } catch (error) {
      console.error("Error processing CSV:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapping = async (mapping: Record<string, string>) => {
    if (!selectedVendor) {
      toast.error("Please select a vendor first");
      return;
    }

    // Process data with mapping
    console.log("Vendor:", selectedVendor);
    console.log("Mapping:", mapping);
    console.log("Data:", csvData);

    // TODO: Save mapping template for this vendor
    // TODO: Process data with mapping and update prices
    setCSVData(null); // Reset for next upload
    setSelectedVendor(""); // Reset vendor selection
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
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? `text-${tab.color}-400 border-${tab.color}-400`
                    : "text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-700"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Pending Updates"
          value="0"
          change="0"
          trend="neutral"
        />
        <QuickStatCard
          title="Price Changes"
          value="0"
          change="0"
          trend="neutral"
        />
        <QuickStatCard
          title="Cost Impact"
          value="$0"
          change="$0"
          trend="neutral"
        />
        <QuickStatCard
          title="Items Processed"
          value="0"
          change="0"
          trend="neutral"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Vendor Selection - Always visible */}
        <VendorSelector
          selectedVendor={selectedVendor}
          onVendorChange={setSelectedVendor}
          fileType={activeTab as "csv" | "pdf" | "photo"}
          onFileTypeChange={(type) => setActiveTab(type)}
        />

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
          ) : csvData && activeTab === "csv" ? (
            <ColumnMapper
              csvColumns={csvColumns}
              onSave={handleMapping}
              onCancel={() => {
                setCSVData(null);
                setSelectedVendor("");
              }}
              selectedVendor={selectedVendor}
            />
          ) : (
            <>
              {activeTab === "csv" && <CSVUploader onUpload={handleUpload} />}
              {activeTab === "pdf" && <PDFUploader onUpload={handleUpload} />}
              {activeTab === "photo" && (
                <PhotoUploader onUpload={handleUpload} />
              )}
              {activeTab === "history" && (
                <div className="text-center py-8 text-gray-400">
                  Import history coming soon...
                </div>
              )}
              {activeTab === "settings" && (
                <div className="text-center py-8 text-gray-400">
                  Import settings coming soon...
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
