import React, { useCallback } from "react";
import { X, Upload, FileSpreadsheet } from "lucide-react";
import { useTeamStore } from "@/stores/teamStore";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import toast from "react-hot-toast";

interface ImportTeamModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ImportTeamModal: React.FC<ImportTeamModalProps> = ({
  isOpen = false,
  onClose,
}) => {
  const { importTeamMembers } = useTeamStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const text = await file.text();
        Papa.parse(text, {
          header: true,
          complete: async (results) => {
            try {
              await importTeamMembers(results.data);
              onClose?.();
            } catch (error) {
              console.error("Error importing team:", error);
              toast.error("Failed to import team data");
            }
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
    },
    [importTeamMembers, onClose],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    multiple: false,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Import Team Data</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

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
                Drag & drop a CSV file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: CSV, XLS, XLSX
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
          <button className="btn-primary text-sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
