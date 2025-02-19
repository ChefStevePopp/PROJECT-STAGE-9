import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, AlertTriangle, Info, Settings } from "lucide-react";
import Papa from "papaparse";

interface Props {
  onUpload: (data: any[]) => void;
  hasTemplate?: boolean;
}

export const CSVUploader: React.FC<Props> = ({
  onUpload,
  hasTemplate = true,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setError(null);
        setIsProcessing(true);

        // First try to detect the delimiter
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const firstLine = text.split("\n")[0];

          // Try to auto-detect the delimiter
          const commaCount = (firstLine.match(/,/g) || []).length;
          const tabCount = (firstLine.match(/\t/g) || []).length;
          const semicolonCount = (firstLine.match(/;/g) || []).length;

          let delimiter = ",";
          if (tabCount > commaCount && tabCount > semicolonCount)
            delimiter = "\t";
          if (semicolonCount > commaCount && semicolonCount > tabCount)
            delimiter = ";";

          Papa.parse(file, {
            delimiter,
            header: true,
            skipEmptyLines: "greedy",
            transformHeader: (header) => {
              return header.trim().toLowerCase();
            },
            complete: (results) => {
              setIsProcessing(false);

              if (results.errors.length > 0) {
                console.error("Parse errors:", results.errors);
                setError(
                  `Error parsing file: ${results.errors[0].message}. Row: ${results.errors[0].row}`,
                );
                return;
              }

              if (!results.data || results.data.length === 0) {
                setError("No valid data found in the file.");
                return;
              }

              // Check if we have any valid columns
              const headers = Object.keys(results.data[0]);
              if (headers.length === 0) {
                setError("No valid columns found in the file.");
                return;
              }

              // Remove any completely empty rows
              const filteredData = results.data.filter((row) =>
                Object.values(row).some((val) => val !== "" && val != null),
              );

              if (filteredData.length === 0) {
                setError("File contains no valid data rows.");
                return;
              }

              onUpload(filteredData);
            },
            error: (error) => {
              console.error("Parse error:", error);
              setError(`Failed to parse file: ${error.message}`);
              setIsProcessing(false);
            },
          });
        };
        reader.readAsText(file);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
      "text/plain": [".csv", ".txt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".csv",
      ],
    },
    multiple: false,
    disabled: !hasTemplate,
  });

  if (!hasTemplate) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 rounded-lg p-6">
          <div className="text-center">
            <Settings className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              CSV Template Required
            </h3>
            <p className="text-gray-400 mb-4">
              Upload a sample CSV invoice to set up the column mapping template
              for this vendor.
            </p>
          </div>
          <CSVUploader onUpload={onUpload} hasTemplate={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium text-blue-400 mb-1">Supported Formats</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>CSV files with comma, tab, or semicolon separators</li>
            <li>Files must have a header row with column names</li>
            <li>
              Required columns: item code, product name, unit price, unit of
              measure
            </li>
          </ul>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${isDragActive ? "border-primary-500 bg-primary-500/10" : "border-gray-700 hover:border-primary-500/50"}
          ${error ? "border-rose-500" : ""}
        `}
      >
        <input {...getInputProps()} />
        <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-white mb-2">
          Drop your vendor invoice CSV here
        </p>
        <p className="text-sm text-gray-400">or click to select file</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};
