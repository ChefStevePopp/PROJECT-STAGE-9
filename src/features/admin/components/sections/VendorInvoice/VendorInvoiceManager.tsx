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
  Umbrella,
  Boxes,
  Package,
  CircleDollarSign,
} from "lucide-react";
import { CSVUploader } from "./components/CSVUploader";
import { QuickStatCard } from "./components/QuickStatCard";
import { ImportSettings } from "./components/ImportSettings";
import { PriceHistory } from "./components/PriceHistory";
import { VendorSelector } from "./components/VendorSelector";
import { PDFUploader } from "./components/PDFUploader";
import { PhotoUploader } from "./components/PhotoUploader";
import { DataPreview } from "./components/DataPreview";
import { MultiCodeManager } from "./components/MultiCodeManager";
import { ItemCodeGroupManager } from "./components/ItemCodeGroupManager";
import { UmbrellaIngredientManager } from "./components/UmbrellaIngredientManager";
import { PriceHistoryView } from "./components/PriceHistoryView";
import { VendorAnalytics } from "./components/VendorAnalytics";
import { ImportHistory } from "./components/ImportHistory";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import { ManualInvoiceForm } from "./components/ManualInvoiceForm";
import { ocrService } from "@/lib/ocr-service";
import toast from "react-hot-toast";

const TABS = [
  {
    id: "dashboard",
    label: "Price History",
    icon: LineChart,
    color: "primary",
  },
  { id: "analytics", label: "Analytics", icon: TrendingUp, color: "green" },
  { id: "codes", label: "Code Groups", icon: Boxes, color: "amber" },
  {
    id: "umbrella",
    label: "Umbrella Items",
    icon: Umbrella,
    color: "rose",
  },
  {
    id: "import",
    label: "Import",
    icon: FileSpreadsheet,
    color: "purple",
  },
  { id: "history", label: "History", icon: History, color: "lime" },
  { id: "settings", label: "Settings", icon: Settings, color: "red" },
] as const;

export const VendorInvoiceManager = () => {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["id"]>("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCSVData] = useState<any[] | null>(null);
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null);
  const [csvColumns, setCSVColumns] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [manualVendorId, setManualVendorId] = useState("");
  const { templates, fetchTemplates } = useVendorTemplatesStore();
  // No need for history refresh key

  // State for import type selection within the Import tab
  const [importType, setImportType] = useState<
    "csv" | "pdf" | "photo" | "manual"
  >("csv");

  // Fetch templates whenever vendor changes
  React.useEffect(() => {
    if (selectedVendor) {
      fetchTemplates(selectedVendor);
    }
  }, [selectedVendor, fetchTemplates]);

  const handleUpload = async (data: any[] | File, fileDate?: Date) => {
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
        if (importType === "pdf") {
          console.log("Processing PDF file with OCR:", data.name);
          const vendorTemplate = templates.find(
            (t) => t.vendor_id === selectedVendor,
          );

          if (!vendorTemplate) {
            toast.error("No template found for this vendor");
            setIsLoading(false);
            return;
          }

          try {
            // Use the OCR service to extract real data from the PDF
            const ocrResults = await ocrService.processPDF(data);
            const extractedData = ocrService.extractInvoiceData(ocrResults);

            // Initialize mappedData as an empty array
            let mappedData = [];

            // Only map if items exist and are in an array
            if (
              extractedData &&
              extractedData.items &&
              Array.isArray(extractedData.items)
            ) {
              mappedData = extractedData.items.map((item, index) => ({
                item_code: item.itemCode || `ITEM-${index + 1}`,
                product_name: item.description || `Product ${index + 1}`,
                unit_price: item.unitPrice || 0,
                unit_of_measure: "EA", // Default unit of measure
              }));
            }

            // If no items were extracted, show a message
            if (mappedData.length === 0) {
              toast.warning(
                "No items could be extracted from the PDF. Adding a placeholder item.",
              );
              // Add a fallback item to show something in the preview
              mappedData.push({
                item_code: "OCR-FAILED",
                product_name: "OCR extraction failed - please try manual entry",
                unit_price: 0,
                unit_of_measure: "EA",
              });
            } else {
              toast.success(
                `Successfully extracted ${mappedData.length} items from PDF`,
              );
            }

            // Set the invoice date from extracted data or default to today
            if (extractedData && extractedData.date) {
              try {
                const parsedDate = new Date(extractedData.date);
                if (!isNaN(parsedDate.getTime())) {
                  setInvoiceDate(parsedDate);
                } else {
                  setInvoiceDate(new Date());
                }
              } catch (e) {
                setInvoiceDate(new Date());
              }
            } else {
              setInvoiceDate(new Date());
            }

            // Set the CSV data to show the preview
            setCSVData(mappedData);
          } catch (pdfError) {
            console.error("PDF processing error:", pdfError);
            toast.error("Failed to process PDF. Adding placeholder data.");

            // Add fallback data
            const fallbackData = [
              {
                item_code: "PDF-ERROR",
                product_name: "PDF processing failed - please try manual entry",
                unit_price: 0,
                unit_of_measure: "EA",
              },
            ];

            setCSVData(fallbackData);
            setInvoiceDate(new Date());
          }
        } else if (importType === "photo") {
          console.log("Processing image file with OCR:", data.name);

          try {
            // Use the OCR service to extract real data from the photo
            const ocrResults = await ocrService.processImage(data);
            const extractedData = ocrService.extractInvoiceData(ocrResults);

            // Initialize mappedData as an empty array
            let mappedData = [];

            // Only map if items exist and are in an array
            if (
              extractedData &&
              extractedData.items &&
              Array.isArray(extractedData.items)
            ) {
              mappedData = extractedData.items.map((item, index) => ({
                item_code: item.itemCode || `ITEM-${index + 1}`,
                product_name: item.description || `Product ${index + 1}`,
                unit_price: item.unitPrice || 0,
                unit_of_measure: "EA", // Default unit of measure
              }));
            }

            // If no items were extracted, show a message
            if (mappedData.length === 0) {
              toast.error(
                "No items could be extracted from the image. Adding a placeholder item.",
              );
              // Add a fallback item to show something in the preview
              mappedData.push({
                item_code: "OCR-FAILED",
                product_name: "OCR extraction failed - please try manual entry",
                unit_price: 0,
                unit_of_measure: "EA",
              });
            } else {
              toast.success(
                `Successfully extracted ${mappedData.length} items from image`,
              );
            }

            // Set the invoice date from extracted data or default to today
            if (extractedData && extractedData.date) {
              try {
                const parsedDate = new Date(extractedData.date);
                if (!isNaN(parsedDate.getTime())) {
                  setInvoiceDate(parsedDate);
                } else {
                  setInvoiceDate(new Date());
                }
              } catch (e) {
                setInvoiceDate(new Date());
              }
            } else {
              setInvoiceDate(new Date());
            }

            // Set the CSV data to show the preview
            setCSVData(mappedData);
          } catch (photoError) {
            console.error("Photo processing error:", photoError);
            toast.error("Failed to process image. Adding placeholder data.");

            // Add fallback data
            const fallbackData = [
              {
                item_code: "PHOTO-ERROR",
                product_name:
                  "Image processing failed - please try manual entry",
                unit_price: 0,
                unit_of_measure: "EA",
              },
            ];

            setCSVData(fallbackData);
            setInvoiceDate(new Date());
          }
        }
      } catch (error) {
        console.error(`Error processing ${importType.toUpperCase()}:`, error);
        toast.error(
          `Failed to process ${importType.toUpperCase()} file: ${error.message}`,
        );

        // Add fallback data even in case of general errors
        const fallbackData = [
          {
            item_code: "ERROR",
            product_name: `${importType.toUpperCase()} processing failed - please try manual entry`,
            unit_price: 0,
            unit_of_measure: "EA",
          },
        ];

        setCSVData(fallbackData);
        setInvoiceDate(new Date());
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

      // Set the invoice date from the file date if available
      if (fileDate) {
        setInvoiceDate(fileDate);
      }

      // Log the date being used for debugging
      console.log(
        "Using invoice date:",
        fileDate ? fileDate.toLocaleDateString() : "Today's date",
      );

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

  const handleManualSubmit = (data: any[], date: Date) => {
    setCSVData(data);
    setInvoiceDate(date);
    setManualVendorId(selectedVendor);
  };

  // No need for refresh function

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center p-4 rounded-lg bg-[#1a1f2b] shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Vendor Invoice Manager
              </h2>
              <p className="text-gray-400">
                Process vendor invoices and update prices
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab("import");
                // Set a small delay to ensure the tab has changed before setting the import type
                setTimeout(() => setImportType("manual"), 50);
              }}
              className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 focus:ring-primary-500/50 border border-primary-500/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Invoice
            </button>
            <button
              onClick={() => {
                setActiveTab("import");
                // Keep the current import type or default to csv
                setTimeout(() => {
                  if (importType === "manual") {
                    setImportType("csv");
                  }
                }, 50);
              }}
              className="btn-ghost-green"
            >
              <Plus className="w-4 h-4 mr-2" />
              Import Invoice
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 overflow-visible">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-tab={tab.id}
              className={`tab ${tab.color} ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="whitespace-normal text-center leading-tight">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Vendor Selection - Only visible for import tab */}
        {activeTab === "import" && (
          <div className="space-y-4">
            <VendorSelector
              selectedVendor={selectedVendor}
              onVendorChange={setSelectedVendor}
              fileType={importType}
              onFileTypeChange={(type) =>
                setImportType(type as "csv" | "pdf" | "photo" | "manual")
              }
            />
            {/* Import button moved to header */}
          </div>
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
          ) : csvData ? (
            <DataPreview
              data={csvData}
              vendorId={manualVendorId || selectedVendor}
              invoiceDate={invoiceDate || new Date()}
              onDateChange={(date) => setInvoiceDate(date)}
              onConfirm={async () => {
                try {
                  // The actual processing happens in the DataPreview component's handleConfirm method
                  // which is called before this callback
                  console.log("Import completed successfully");
                  toast.success(
                    "Data imported and prices updated successfully",
                  );
                  setCSVData(null);
                  setSelectedVendor("");

                  // Switch to the history tab and ensure it's refreshed
                  setActiveTab("history");
                  // Small delay to ensure the tab has changed before refreshing
                  setTimeout(() => {
                    // Find and click the refresh button in the ImportHistory component
                    const refreshButton = document.querySelector(
                      ".ImportHistory button.btn-ghost",
                    );
                    if (refreshButton) {
                      (refreshButton as HTMLButtonElement).click();
                    }
                  }, 100);
                } catch (error) {
                  console.error("Error in import confirmation:", error);
                  toast.error("There was an error completing the import");
                }
              }}
              onCancel={() => {
                setCSVData(null);
                setSelectedVendor("");
              }}
            />
          ) : (
            <>
              {activeTab === "dashboard" && <PriceHistory />}
              {activeTab === "analytics" && <VendorAnalytics />}
              {activeTab === "codes" && <ItemCodeGroupManager />}
              {activeTab === "umbrella" && <UmbrellaIngredientManager />}
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
                  {importType === "manual" && (
                    <div className="space-y-6">
                      {selectedVendor ? (
                        <ManualInvoiceForm
                          onSubmit={handleManualSubmit}
                          onCancel={() => {
                            setSelectedVendor("");
                            setImportType("csv");
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-lg bg-gray-800/50">
                          <h3 className="text-lg font-medium text-white mb-2">
                            Manual Invoice Entry
                          </h3>
                          <p className="text-gray-400 text-center mb-4">
                            Please select a vendor first to begin manual entry
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              {activeTab === "history" && <ImportHistory />}
              {activeTab === "settings" && <ImportSettings />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
