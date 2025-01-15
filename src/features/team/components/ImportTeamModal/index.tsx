import React, { useCallback, useState } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import toast from "react-hot-toast";

interface ImportTeamModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const TEMPLATE_COLUMNS = [
  { key: "first_name", label: "First Name", required: true, example: "John" },
  { key: "last_name", label: "Last Name", required: true, example: "Smith" },
  {
    key: "email",
    label: "Email",
    required: true,
    example: "john.smith@example.com",
  },
  { key: "phone", label: "Phone", required: false, example: "555-0123" },
  { key: "punch_id", label: "Employee ID", required: false, example: "EMP001" },
  {
    key: "kitchen_role",
    label: "Kitchen Role",
    required: false,
    example: "Line Cook",
  },
  {
    key: "departments",
    label: "Departments",
    required: false,
    example: "Kitchen,Prep",
  },
  { key: "roles", label: "Roles", required: false, example: "Grill,Sauté" },
];

export const ImportTeamModal: React.FC<ImportTeamModalProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { importTeamMembers } = useTeamStore();
  const [fileData, setFileData] = useState<any[] | null>(null);

  const downloadTemplate = () => {
    // Create CSV header
    const headers = TEMPLATE_COLUMNS.map((col) => col.key);

    // Create example row
    const exampleRow = TEMPLATE_COLUMNS.map((col) => col.example);

    // Combine into CSV content
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "team_import_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          // Validate required columns
          const headers = Object.keys(results.data[0] || {});
          const missingColumns = TEMPLATE_COLUMNS.filter(
            (col) => col.required,
          ).filter((col) => !headers.includes(col.key));

          if (missingColumns.length > 0) {
            toast.error(
              `Missing required columns: ${missingColumns.map((col) => col.label).join(", ")}`,
            );
            return;
          }

          setFileData(results.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          toast.error("Failed to parse CSV file");
        },
      });
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  const handleImport = async () => {
    if (!fileData) return;

    try {
      await importTeamMembers(fileData);
      onClose?.();
      toast.success("Team members imported successfully");
    } catch (error) {
      console.error("Error importing team:", error);
      toast.error("Failed to import team data");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Import Team Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Download Section */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-5 h-5 text-primary-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white mb-1">
                Download Template
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Start with our CSV template that includes all required fields
                and an example row.
              </p>
              <button
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>
            </div>
          </div>
        </div>

        {/* Required Fields List */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white mb-2">
            Required Fields
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATE_COLUMNS.filter((col) => col.required).map((col) => (
              <div key={col.key} className="text-sm text-gray-400">
                • {col.label}
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary-500/50 bg-primary-500/5"
              : "border-gray-700 hover:border-primary-500/50 hover:bg-gray-700/50"
          }`}
        >
          <input {...getInputProps()} />
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-primary-400">Drop the file here...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-300">
                Drag & drop your CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Make sure to use the template format
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="btn-primary text-sm"
            disabled={!fileData}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
