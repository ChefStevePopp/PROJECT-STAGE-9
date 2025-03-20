import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileSpreadsheet,
  AlertTriangle,
  Info,
  Settings,
  Calendar,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Papa from "papaparse";

interface Props {
  onUpload: (data: any[], fileDate?: Date) => void;
  hasTemplate?: boolean;
}

export const CSVUploader: React.FC<Props> = ({
  onUpload,
  hasTemplate = true,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedDate, setDetectedDate] = useState<Date | null>(null);
  const [showDateConfirmation, setShowDateConfirmation] = useState(false);
  const [showFormatInfo, setShowFormatInfo] = useState(false);

  // Function to detect date from filename
  const detectDateFromFilename = (filename: string): Date | null => {
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

    // Try different date formats
    // Format: MM-DD-YYYY or DD-MM-YYYY
    const dashFormat = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
    // Format: MM-DD-YY or DD-MM-YY
    const dashFormatShortYear = /^(\d{1,2})-(\d{1,2})-(\d{2})$/;
    // Format: YYYY-MM-DD
    const isoFormat = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    // Format: MM_DD_YYYY or DD_MM_YYYY
    const underscoreFormat = /^(\d{1,2})_(\d{1,2})_(\d{4})$/;
    // Format: MM_DD_YY or DD_MM_YY
    const underscoreFormatShortYear = /^(\d{1,2})_(\d{1,2})_(\d{2})$/;
    // Format: MMDDYYYY or DDMMYYYY
    const noSeparatorFormat = /^(\d{2})(\d{2})(\d{4})$/;
    // Format: MMDDYY or DDMMYY
    const noSeparatorFormatShortYear = /^(\d{2})(\d{2})(\d{2})$/;

    let match;
    let date: Date | null = null;

    if ((match = nameWithoutExt.match(dashFormat))) {
      // Try both MM-DD-YYYY and DD-MM-YYYY interpretations
      const [_, part1, part2, year] = match;
      // Try as MM-DD-YYYY first
      date = new Date(`${year}-${part1}-${part2}`);
      if (isNaN(date.getTime())) {
        // Try as DD-MM-YYYY
        date = new Date(`${year}-${part2}-${part1}`);
      }
    } else if ((match = nameWithoutExt.match(dashFormatShortYear))) {
      // Handle MM-DD-YY format
      const [_, part1, part2, shortYear] = match;
      const fullYear = 2000 + parseInt(shortYear, 10); // Assume 20xx for years
      // Try as MM-DD-YY first
      date = new Date(`${fullYear}-${part1}-${part2}`);
      if (isNaN(date.getTime())) {
        // Try as DD-MM-YY
        date = new Date(`${fullYear}-${part2}-${part1}`);
      }
    } else if ((match = nameWithoutExt.match(isoFormat))) {
      const [_, year, month, day] = match;
      date = new Date(`${year}-${month}-${day}`);
    } else if ((match = nameWithoutExt.match(underscoreFormat))) {
      const [_, part1, part2, year] = match;
      // Try as MM_DD_YYYY first
      date = new Date(`${year}-${part1}-${part2}`);
      if (isNaN(date.getTime())) {
        // Try as DD_MM_YYYY
        date = new Date(`${year}-${part2}-${part1}`);
      }
    } else if ((match = nameWithoutExt.match(underscoreFormatShortYear))) {
      // Handle MM_DD_YY format
      const [_, part1, part2, shortYear] = match;
      const fullYear = 2000 + parseInt(shortYear, 10); // Assume 20xx for years
      // Try as MM_DD_YY first
      date = new Date(`${fullYear}-${part1}-${part2}`);
      if (isNaN(date.getTime())) {
        // Try as DD_MM_YY
        date = new Date(`${fullYear}-${part2}-${part1}`);
      }
    } else if ((match = nameWithoutExt.match(noSeparatorFormat))) {
      const [_, part1, part2, year] = match;
      // Try as MMDDYYYY first
      date = new Date(`${year}-${part1}-${part2}`);
      if (isNaN(date.getTime())) {
        // Try as DDMMYYYY
        date = new Date(`${year}-${part2}-${part1}`);
      }
    } else if ((match = nameWithoutExt.match(noSeparatorFormatShortYear))) {
      // Handle MMDDYY format
      const [_, part1, part2, shortYear] = match;
      const fullYear = 2000 + parseInt(shortYear, 10); // Assume 20xx for years
      // Try as MMDDYY first
      date = new Date(`${fullYear}-${part1}-${part2}`);
      if (isNaN(date.getTime())) {
        // Try as DDMMYY
        date = new Date(`${fullYear}-${part2}-${part1}`);
      }
    }

    // Validate the date is reasonable (not in the future and not too far in the past)
    if (date && !isNaN(date.getTime())) {
      const now = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);

      if (date > now || date < twoYearsAgo) {
        return null; // Date is too far in the future or past
      }
      return date;
    }

    return null;
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setError(null);
        setIsProcessing(true);

        // Check if filename contains a date
        const possibleDate = detectDateFromFilename(file.name);
        if (possibleDate) {
          setDetectedDate(possibleDate);
          setShowDateConfirmation(true);
        }

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

              // Make sure we're passing the detected date to onUpload
              onUpload(filteredData, possibleDate || detectedDate);
              setShowDateConfirmation(false);
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
      {showDateConfirmation && detectedDate && (
        <div className="bg-amber-500/10 rounded-lg p-4 flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-gray-300">
            <p className="font-medium text-amber-400 mb-1">
              Date Detected in Filename
            </p>
            <p className="text-gray-400 mb-2">
              We detected the date {detectedDate.toLocaleDateString()} in your
              file name. Would you like to use this as the invoice date?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Clear the detected date when user declines
                  setShowDateConfirmation(false);
                  setDetectedDate(null);
                }}
                className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center gap-1 text-xs transition-colors"
              >
                <X className="w-3 h-3" />
                No, ignore
              </button>
              <button
                onClick={() => {
                  // Keep the detected date when user confirms
                  setShowDateConfirmation(false);
                }}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 flex items-center gap-1 text-xs transition-colors"
              >
                <Check className="w-3 h-3" />
                Yes, use this date
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-500/10 rounded-lg p-4">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowFormatInfo((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <p className="font-medium text-blue-400">Supported Formats</p>
          </div>
          {showFormatInfo ? (
            <ChevronUp className="w-4 h-4 text-blue-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-400" />
          )}
        </div>

        {showFormatInfo && (
          <div className="mt-3 pl-7 text-sm text-gray-300">
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>CSV files with comma, tab, or semicolon separators</li>
              <li>Files must have a header row with column names</li>
              <li>
                Required columns: item code, product name, unit price, unit of
                measure
              </li>
              <li>
                Pro tip: Name your file with a date (e.g., 01-02-2024.csv) to
                auto-detect the invoice date
              </li>
            </ul>
          </div>
        )}
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
        <input id="csv-file-input" {...getInputProps()} />
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
