import React from "react";
import {
  Store,
  FileSpreadsheet,
  FileText,
  Camera,
  Info,
  Calendar,
  Edit,
} from "lucide-react";
import { useOperationsStore } from "@/stores/operationsStore";
import { useVendorTemplatesStore } from "@/stores/vendorTemplatesStore";
import { useVendorInvoiceStore } from "@/stores/vendorInvoiceStore";
import { format } from "date-fns";

interface Props {
  selectedVendor: string;
  onVendorChange: (vendor: string) => void;
  fileType: "csv" | "pdf" | "photo" | "manual";
  onFileTypeChange: (type: "csv" | "pdf" | "photo" | "manual") => void;
}

export const VendorSelector: React.FC<Props> = ({
  selectedVendor,
  onVendorChange,
  fileType,
  onFileTypeChange,
}) => {
  const { settings, fetchSettings } = useOperationsStore();
  const { templates } = useVendorTemplatesStore();
  const { fetchLastInvoice, lastInvoice } = useVendorInvoiceStore();
  const vendors = settings?.vendors || [];

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  React.useEffect(() => {
    if (selectedVendor) {
      fetchLastInvoice(selectedVendor);
    }
  }, [selectedVendor, fetchLastInvoice]);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6 p-6 rounded-lg bg-[#262d3c] shadow-lg">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">Invoice Processing</h3>
          <p className="text-sm text-gray-400">
            Select vendor and upload method
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          {selectedVendor && fileType !== "manual" && (
            <div className="mt-2">
              <div className="flex flex-col gap-2">
                {templates.some((t) => t.vendor_id === selectedVendor) ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        CSV template configured
                      </span>
                    </div>
                    {lastInvoice && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {lastInvoice.filename
                            ? `Last upload: ${lastInvoice.filename}`
                            : `Last upload: ${format(new Date(lastInvoice.created_at), "MMM d, yyyy")}`}
                        </span>
                      </div>
                    )}
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
            </div>
          )}
          {selectedVendor && fileType === "manual" && lastInvoice && (
            <div className="mt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {lastInvoice.filename
                    ? `Last upload: ${lastInvoice.filename}`
                    : `Last upload: ${format(new Date(lastInvoice.created_at), "MMM d, yyyy")}`}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Upload Method
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onFileTypeChange("csv")}
              className={`tab primary ${fileType === "csv" ? "active" : ""} text-sm`}
            >
              <FileSpreadsheet
                className={`w-5 h-5 mr-1 ${fileType === "csv" ? "text-primary-400" : ""}`}
              />
              CSV
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("pdf")}
              className={`tab green ${fileType === "pdf" ? "active" : ""} text-sm`}
            >
              <FileText
                className={`w-5 h-5 mr-1 ${fileType === "pdf" ? "text-green-400" : ""}`}
              />
              PDF
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("photo")}
              className={`tab amber ${fileType === "photo" ? "active" : ""} text-sm`}
            >
              <Camera
                className={`w-5 h-5 mr-1 ${fileType === "photo" ? "text-amber-400" : ""}`}
              />
              Photo
            </button>
            <button
              type="button"
              onClick={() => onFileTypeChange("manual")}
              className={`tab purple ${fileType === "manual" ? "active" : ""} text-sm`}
            >
              <Edit
                className={`w-5 h-5 mr-1 ${fileType === "manual" ? "text-purple-400" : ""}`}
              />
              Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
