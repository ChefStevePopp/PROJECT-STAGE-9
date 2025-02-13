import React from "react";
import { ArrowRight, Save } from "lucide-react";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import toast from "react-hot-toast";

interface Props {
  csvColumns: string[];
  onSave: (mapping: Record<string, string>) => void;
  onCancel: () => void;
  selectedVendor: string;
}

const REQUIRED_FIELDS = [
  { key: "item_code", label: "Item Code" },
  { key: "product_name", label: "Product Name" },
  { key: "unit_price", label: "Unit Price" },
  { key: "unit_of_measure", label: "Unit of Measure" },
];

interface PreviewData {
  columnName: string;
  sampleData: string[];
}

export const ColumnMapper: React.FC<Props> = ({
  csvColumns,
  onSave,
  onCancel,
}) => {
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [previewData, setPreviewData] = React.useState<
    Record<string, string[]>
  >({});

  // Get sample data for each column (first 3 rows)
  React.useEffect(() => {
    const preview: Record<string, string[]> = {};
    csvColumns.forEach((col) => {
      preview[col] = ["Sample 1", "Sample 2", "Sample 3"]; // Replace with actual data
    });
    setPreviewData(preview);
  }, [csvColumns]);

  const { saveTemplate } = useVendorTemplatesStore();

  const handleSave = async () => {
    if (!selectedVendor) {
      toast.error("Please select a vendor first");
      return;
    }

    try {
      // Save the template for future use
      await saveTemplate({
        vendor_id: selectedVendor,
        name: `${selectedVendor} CSV Template`,
        file_type: "csv",
        column_mapping: mapping,
      });

      toast.success("Template saved for future use");
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
    // Validate all required fields are mapped
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => !mapping[field.key],
    );
    if (missingFields.length > 0) {
      alert(
        `Please map all required fields: ${missingFields.map((f) => f.label).join(", ")}`,
      );
      return;
    }
    onSave(mapping);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Map CSV Columns</h3>
        <p className="text-sm text-gray-400 mb-6">
          Match your CSV columns to our required fields. This mapping will be
          saved for future uploads from this vendor.
        </p>

        <div className="space-y-6">
          {REQUIRED_FIELDS.map((field) => (
            <div
              key={field.key}
              className="bg-gray-900/50 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-400">
                    {field.label}*
                  </label>
                  <div className="text-xs text-gray-500 mt-1">
                    Expected:{" "}
                    {field.key === "item_code"
                      ? "ABC123"
                      : field.key === "product_name"
                        ? "Product Description"
                        : field.key === "unit_price"
                          ? "$12.34"
                          : "12 CS"}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) =>
                      setMapping((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="input w-full"
                    required
                  >
                    <option value="">Select CSV column...</option>
                    {csvColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                  {mapping[field.key] && previewData[mapping[field.key]] && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs font-medium text-gray-500">
                        Preview:
                      </div>
                      <div className="text-sm text-gray-400 bg-gray-800/50 rounded p-2">
                        {previewData[mapping[field.key]].map((sample, i) => (
                          <div key={i} className="truncate">
                            {sample}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Mapping
          </button>
        </div>
      </div>
    </div>
  );
};
