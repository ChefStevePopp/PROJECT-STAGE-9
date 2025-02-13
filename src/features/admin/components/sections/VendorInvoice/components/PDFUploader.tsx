import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, AlertTriangle, Info } from "lucide-react";

interface Props {
  onUpload: (file: File) => void;
}

export const PDFUploader: React.FC<Props> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          setError("File size too large. Maximum size is 10MB.");
          return;
        }
        setError(null);
        onUpload(file);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div className="bg-rose-500/10 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-300">
          <p className="font-medium text-rose-400 mb-1">PDF Processing</p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Upload clear, high-quality PDF invoices</li>
            <li>Maximum file size: 10MB</li>
            <li>Text should be clear and readable</li>
            <li>Avoid scanned documents if possible</li>
          </ul>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          flex flex-col items-center justify-center
          transition-colors cursor-pointer
          ${isDragActive ? "border-rose-500 bg-rose-500/10" : "border-gray-700 hover:border-rose-500/50"}
          ${error ? "border-rose-500" : ""}
        `}
      >
        <input {...getInputProps()} />
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-white mb-2">
          Drop your vendor invoice PDF here
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
