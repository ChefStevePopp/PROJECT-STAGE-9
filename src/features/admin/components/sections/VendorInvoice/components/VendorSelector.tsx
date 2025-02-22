import React from "react";
import { Store, FileSpreadsheet, FileText, Camera, Info } from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";

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
  const { templates } = useVendorTemplatesStore();
  const vendors = settings?.vendors || [];

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-[#1a1f2b]">
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
          {selectedVendor && (
            <div className="mt-2">
              {templates.some((t) => t.vendor_id === selectedVendor) ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    CSV template configured
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    No CSV template - setup required
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Upload Method
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onFileTypeChange("csv")}
              className={`tab primary ${fileType === "csv" ? "active" : ""}`}
            >
              <FileSpreadsheet
                className={`w-5 h-5 mr-2 ${fileType === "csv" ? "text-primary-400" : ""}`}
              />
              CSV
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("pdf")}
              className={`tab green ${fileType === "pdf" ? "active" : ""}`}
            >
              <FileText
                className={`w-5 h-5 mr-2 ${fileType === "pdf" ? "text-green-400" : ""}`}
              />
              PDF
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("photo")}
              className={`tab amber ${fileType === "photo" ? "active" : ""}`}
            >
              <Camera
                className={`w-5 h-5 mr-2 ${fileType === "photo" ? "text-amber-400" : ""}`}
              />
              Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
