import React from "react";
import { Settings, Plus, Trash2, FileSpreadsheet } from "lucide-react";
import { CSVUploader } from "./CSVUploader";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import { useOperationsStore } from "@/stores/operationsStore";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Settings className="w-5 h-5 text-purple-400" />
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

      <div className="bg-blue-500/10 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-300">
          These settings are specifically for CSV file imports. Each vendor can
          have their own column mapping template that will be automatically
          applied when importing their CSV files. PDF and photo imports use OCR
          technology and don't require column mapping.
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

            {/* Sample Invoice Upload */}
            {!isEditing && !templates.length && (
              <div className="bg-gray-900/50 rounded-lg p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                  <FileSpreadsheet className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white mb-2">
                    Upload Sample Invoice
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Upload a sample CSV invoice from this vendor to
                    automatically detect columns and set up mapping
                  </p>
                  <CSVUploader onUpload={handleCSVUpload} />
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
