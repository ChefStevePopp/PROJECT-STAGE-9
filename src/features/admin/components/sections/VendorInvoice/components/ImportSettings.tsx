import React from "react";
import {
  Settings,
  Plus,
  Trash2,
  FileSpreadsheet,
  Table,
  Camera,
  FileText,
} from "lucide-react";
import { CSVUploader } from "./CSVUploader";
import { PDFUploader } from "./PDFUploader";
import { PhotoUploader } from "./PhotoUploader";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import { useOperationsStore } from "@/stores/operationsStore";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { ocrService, OCRResult } from "@/lib/ocr-service";

const REQUIRED_FIELDS = [
  { key: "item_code", label: "Item Code" },
  { key: "product_name", label: "Product Name" },
  { key: "unit_price", label: "Unit Price" },
  { key: "unit_of_measure", label: "Unit of Measure" },
];

export const ImportSettings = () => {
  const { organization } = useAuth();
  const { settings } = useOperationsStore();
  const { templates, fetchTemplates, saveTemplate, deleteTemplate } =
    useVendorTemplatesStore();
  const [selectedVendor, setSelectedVendor] = React.useState("");
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<any[] | null>(null);
  const [uploadType, setUploadType] = React.useState<"csv" | "pdf" | "photo">(
    "csv",
  );
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    if (selectedVendor) {
      fetchTemplates(selectedVendor);
    }
  }, [selectedVendor, fetchTemplates]);

  const handleSaveMapping = async () => {
    if (!selectedVendor || !organization?.id) {
      toast.error("Please select a vendor");
      return;
    }

    try {
      await saveTemplate({
        vendor_id: selectedVendor,
        name: `${selectedVendor} CSV Template`,
        file_type: "csv",
        column_mapping: mapping,
        organization_id: organization.id,
      });
      setIsEditing(false);
      setPreviewData(null);
      toast.success("Column mapping saved successfully");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save column mapping");
    }
  };

  const handleCSVUpload = (data: any[]) => {
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      setPreviewData(data.slice(0, 3)); // Store first 3 rows for preview
      setMapping({
        item_code:
          columns.find(
            (c) =>
              c.toLowerCase().includes("item") ||
              c.toLowerCase().includes("code"),
          ) || "",
        product_name:
          columns.find(
            (c) =>
              c.toLowerCase().includes("product") ||
              c.toLowerCase().includes("name") ||
              c.toLowerCase().includes("description"),
          ) || "",
        unit_price:
          columns.find(
            (c) =>
              c.toLowerCase().includes("price") ||
              c.toLowerCase().includes("cost"),
          ) || "",
        unit_of_measure:
          columns.find(
            (c) =>
              c.toLowerCase().includes("uom") ||
              c.toLowerCase().includes("unit") ||
              c.toLowerCase().includes("measure"),
          ) || "",
      });
      setIsEditing(true);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    console.log(
      `Starting file upload processing for ${uploadType}:`,
      file.name,
      file.type,
      `${Math.round(file.size / 1024)} KB`,
    );

    try {
      let extractedData;
      let mappedData = [];

      if (uploadType === "pdf") {
        try {
          console.log("Starting PDF OCR processing...");
          // Process PDF with OCR
          const ocrResults = await ocrService.processPDF(file);
          console.log(
            "PDF OCR processing complete. Results:",
            ocrResults ? `${ocrResults.length} items` : "no results",
          );

          extractedData = ocrService.extractInvoiceData(ocrResults);
          console.log("Invoice data extraction complete:", extractedData);

          // Map the extracted data to the format expected by the preview
          if (
            extractedData &&
            extractedData.items &&
            Array.isArray(extractedData.items)
          ) {
            console.log(
              `Mapping ${extractedData.items.length} extracted items to display format`,
            );
            mappedData = extractedData.items.map((item, index) => ({
              "Item Code": item.itemCode || `ITEM-${index + 1}`,
              "Product Name": item.description || `Product ${index + 1}`,
              "Unit Price": item.unitPrice?.toString() || "0",
              UOM: "EA", // Default unit of measure
            }));
            console.log("Mapped data:", mappedData);
          } else {
            console.warn("No valid items found in extracted data");
          }
        } catch (pdfError) {
          console.error("PDF processing error:", pdfError);
          toast.error("Error processing PDF. Using sample data instead.");
        }
      } else if (uploadType === "photo") {
        try {
          console.log("Starting photo OCR processing...");
          // Process image with OCR
          const ocrResults = await ocrService.processImage(file);
          console.log(
            "Photo OCR processing complete. Results:",
            ocrResults ? `${ocrResults.length} items` : "no results",
          );

          extractedData = ocrService.extractInvoiceData(ocrResults);
          console.log("Invoice data extraction complete:", extractedData);

          // Map the extracted data to the format expected by the preview
          if (
            extractedData &&
            extractedData.items &&
            Array.isArray(extractedData.items)
          ) {
            console.log(
              `Mapping ${extractedData.items.length} extracted items to display format`,
            );
            mappedData = extractedData.items.map((item, index) => ({
              "Item Code": item.itemCode || `ITEM-${index + 1}`,
              "Product Name": item.description || `Product ${index + 1}`,
              "Unit Price": item.unitPrice?.toString() || "0",
              UOM: "EA", // Default unit of measure
            }));
            console.log("Mapped data:", mappedData);
          } else {
            console.warn("No valid items found in extracted data");
          }
        } catch (photoError) {
          console.error("Photo processing error:", photoError);
          toast.error("Error processing image. Using sample data instead.");
        }
      }

      // If no items were extracted or we're using fallback data
      if (!mappedData || mappedData.length === 0) {
        toast.error(
          "No items could be extracted. Using sample data for template setup.",
        );

        // Provide fallback data for template setup
        mappedData = [
          {
            "Item Code": "ABC123",
            "Product Name": "Sample Product 1",
            "Unit Price": "19.99",
            UOM: "EA",
          },
          {
            "Item Code": "DEF456",
            "Product Name": "Sample Product 2",
            "Unit Price": "29.99",
            UOM: "CS",
          },
          {
            "Item Code": "GHI789",
            "Product Name": "Sample Product 3",
            "Unit Price": "9.99",
            UOM: "LB",
          },
        ];
      } else {
        toast.success(
          `Successfully extracted ${mappedData.length} items from ${uploadType}`,
        );
      }

      setPreviewData(mappedData);
      setMapping({
        item_code: "Item Code",
        product_name: "Product Name",
        unit_price: "Unit Price",
        unit_of_measure: "UOM",
      });

      setIsEditing(true);
    } catch (error) {
      console.error(`Error processing ${uploadType}:`, error);
      toast.error(`Failed to process ${uploadType} file: ${error.message}`);

      // Provide fallback data even in case of errors
      const fallbackData = [
        {
          "Item Code": "ERROR1",
          "Product Name": "Error occurred - Sample 1",
          "Unit Price": "0.00",
          UOM: "EA",
        },
        {
          "Item Code": "ERROR2",
          "Product Name": "Error occurred - Sample 2",
          "Unit Price": "0.00",
          UOM: "EA",
        },
      ];

      setPreviewData(fallbackData);
      setMapping({
        item_code: "Item Code",
        product_name: "Product Name",
        unit_price: "Unit Price",
        unit_of_measure: "UOM",
      });
      setIsEditing(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6 p-6 rounded-lg bg-[#262d3c] shadow-lg">
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">
            CSV Import Settings
          </h3>
          <p className="text-sm text-gray-400">
            Configure vendor-specific CSV column mappings
          </p>
        </div>
      </div>

      <div className="bg-red-500/10 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-300">
          These settings allow you to configure how invoice data is imported.
          Each vendor can have their own column mapping template that will be
          automatically applied when importing their CSV files. Columns are
          mapped directly to standardize data across different vendor formats.
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6">
        {/* Vendor Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Select Vendor
          </label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="input w-full"
          >
            <option value="">Choose a vendor...</option>
            {settings?.vendors?.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>

        {selectedVendor && (
          <div className="space-y-4">
            {/* Existing Templates */}
            {templates.map((template) => (
              <div key={template.id} className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-400">
                      Last updated:{" "}
                      {new Date(template.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMapping(template.column_mapping || {});
                        setIsEditing(true);
                      }}
                      className="btn-ghost btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="btn-ghost btn-sm text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {REQUIRED_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="flex justify-between items-center p-2 bg-gray-800/50 rounded"
                    >
                      <span className="text-gray-400">{field.label}</span>
                      <span className="text-gray-300">
                        {template.column_mapping?.[field.key] || "Not mapped"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Upload Type Selector */}
            {!isEditing && !templates.length && (
              <div className="bg-gray-900/50 rounded-lg p-6 text-center space-y-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                  {uploadType === "csv" && (
                    <Table className="w-6 h-6 text-purple-400" />
                  )}
                  {/* 
      {uploadType === "pdf" && (
        <FileText className="w-6 h-6 text-rose-400" />
      )}
      {uploadType === "photo" && (
        <Camera className="w-6 h-6 text-emerald-400" />
      )}
      */}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Upload Sample Invoice
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload a sample invoice from this vendor to automatically
                    detect data and set up mapping
                  </p>

                  {/* Upload Type Toggle */}
                  <div className="flex justify-center gap-2 mb-6">
                    <button
                      onClick={() => setUploadType("csv")}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploadType === "csv" ? "bg-primary-500/20 text-primary-400" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                    >
                      <Table className="w-4 h-4" />
                      CSV
                    </button>
                    {/* 
        <button
          onClick={() => setUploadType("pdf")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploadType === "pdf" ? "bg-rose-500/20 text-rose-400" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          <FileText className="w-4 h-4" />
          PDF
        </button>
        <button
          onClick={() => setUploadType("photo")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${uploadType === "photo" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
        >
          <Camera className="w-4 h-4" />
          Photo
        </button>
        */}
                  </div>

                  {/* Conditional Uploader Component */}
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-12 h-12 border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-300">
                        Processing {uploadType.toUpperCase()} file...
                      </p>
                    </div>
                  ) : (
                    <>
                      {uploadType === "csv" && (
                        <CSVUploader onUpload={handleCSVUpload} />
                      )}
                      {/* 
          {uploadType === "pdf" && (
            <PDFUploader onUpload={handleFileUpload} />
          )}
          {uploadType === "photo" && (
            <PhotoUploader onUpload={handleFileUpload} />
          )}
          */}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Add New Template Button */}
            {!isEditing && templates.length > 0 && (
              <button
                onClick={() => {
                  setMapping({});
                  setIsEditing(true);
                }}
                className="btn-ghost w-full py-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Mapping
              </button>
            )}

            {/* CSV Preview */}
            {previewData && (
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Sample Data Preview (First 3 Rows)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-800/50">
                      <tr>
                        {Object.keys(previewData[0]).map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-400"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {previewData.map((row, idx) => (
                        <tr key={idx}>
                          {Object.keys(row).map((col) => (
                            <td
                              key={col}
                              className="px-3 py-2 text-xs text-gray-300 whitespace-nowrap"
                            >
                              {row[col]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mapping Editor */}
            {isEditing && previewData && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-400 font-medium mb-2">
                    Important
                  </p>
                  <p className="text-sm text-gray-300">
                    We've attempted to auto-detect column mappings based on
                    common naming patterns. Please carefully verify these
                    mappings and adjust if needed. Incorrect mappings can lead
                    to data import errors.
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
                  <h4 className="text-white font-medium mb-4">
                    Column Mapping
                  </h4>
                  {REQUIRED_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-2 gap-4 items-center"
                    >
                      <label className="text-gray-400">{field.label}*</label>
                      <select
                        value={mapping[field.key] || ""}
                        onChange={(e) =>
                          setMapping((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        className="input"
                        required
                      >
                        <option value="">Select column...</option>
                        {Object.keys(previewData[0]).map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setPreviewData(null);
                      }}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMapping}
                      className="btn-primary"
                      disabled={!Object.values(mapping).every(Boolean)}
                    >
                      Save Mapping
                    </button>
                  </div>
                  {!Object.values(mapping).every(Boolean) && (
                    <p className="text-sm text-rose-400 mt-2">
                      Please map all required fields before saving
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
