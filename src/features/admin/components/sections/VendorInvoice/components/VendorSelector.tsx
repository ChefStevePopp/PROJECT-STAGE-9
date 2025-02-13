import React from "react";
import { Store, FileSpreadsheet, FileText, Camera } from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";

interface Props {
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  fileType: "csv" | "pdf" | "photo";
  onFileTypeChange: (type: "csv" | "pdf" | "photo") => void;
}

export const VendorSelector: React.FC<Props> = ({
  selectedVendor,
  onVendorChange,
  fileType,
  onFileTypeChange,
}) => {
  const { settings, fetchSettings } = useOperationsStore();
  const vendors = settings?.vendors || [];

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Store className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">Invoice Processing</h3>
          <p className="text-sm text-gray-400">
            Select vendor and upload method
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Vendor
          </label>
          <select
            value={selectedVendor}
            onChange={(e) => onVendorChange(e.target.value)}
            className="input w-full"
            required
          >
            <option value="">Select a vendor...</option>
            {vendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Upload Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onFileTypeChange("csv")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${fileType === "csv" ? "bg-primary-500/20 border border-primary-500/50" : "bg-gray-800/50 border border-transparent hover:border-gray-700"}`}
            >
              <FileSpreadsheet
                className={`w-5 h-5 mb-1 ${fileType === "csv" ? "text-primary-400" : "text-gray-400"}`}
              />
              <span className="text-xs font-medium">CSV</span>
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("pdf")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${fileType === "pdf" ? "bg-rose-500/20 border border-rose-500/50" : "bg-gray-800/50 border border-transparent hover:border-gray-700"}`}
            >
              <FileText
                className={`w-5 h-5 mb-1 ${fileType === "pdf" ? "text-rose-400" : "text-gray-400"}`}
              />
              <span className="text-xs font-medium">PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("photo")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${fileType === "photo" ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-gray-800/50 border border-transparent hover:border-gray-700"}`}
            >
              <Camera
                className={`w-5 h-5 mb-1 ${fileType === "photo" ? "text-emerald-400" : "text-gray-400"}`}
              />
              <span className="text-xs font-medium">Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
