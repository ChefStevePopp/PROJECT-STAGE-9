import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { LoadingLogo } from '@/features/shared/components';
import toast from 'react-hot-toast';

interface ImportTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => Promise<void>;
}

export const ImportTeamModal: React.FC<ImportTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  // Required columns for team data
  const requiredColumns = [
    'First Name',
    'Last name',
    'Email',
    'Mobile phone',
    'Wage',
    'Punch ID',
    'Locations',
    'Departments',
    'Roles'
  ];

  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setPreviewData(null);

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const hasBOM = text.charCodeAt(0) === 0xFEFF;
      const content = hasBOM ? text.slice(1) : text;

      Papa.parse(content, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              const errorMessage = results.errors
                .map(err => `Row ${err.row}: ${err.message}`)
                .join('\n');
              throw new Error(`CSV parsing errors:\n${errorMessage}`);
            }

            // Validate required columns
            const headers = Object.keys(results.data[0] || {});
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            
            if (missingColumns.length > 0) {
              throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
            }

            // Filter out completely empty rows
            const validRows = results.data.filter((row: any) => {
              const firstName = row['First Name']?.toString().trim();
              const lastName = row['Last name']?.toString().trim();
              return firstName && lastName;
            });

            if (validRows.length === 0) {
              throw new Error('No valid data found in CSV file');
            }

            setPreviewData(validRows);
            setIsProcessing(false);
          } catch (error) {
            console.error('Error processing team data:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process team data');
            setPreviewData(null);
            setIsProcessing(false);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Failed to read CSV file');
          setPreviewData(null);
          setIsProcessing(false);
        }
      });
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsProcessing(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: files => files[0] && handleFileUpload(files[0])
  });

  const handleImport = async () => {
    if (!previewData) return;

    try {
      await onImport(previewData);
      onClose();
    } catch (error) {
      toast.error('Failed to import team data');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Import Team Data</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isProcessing ? (
            <LoadingLogo message="Processing team data..." />
          ) : previewData ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Data Preview</h3>
              <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                {previewData.slice(0, 3).map((row, index) => (
                  <div key={index} className="flex gap-4 text-sm">
                    <span className="text-gray-400">
                      {row['Punch ID'] || 'N/A'}
                    </span>
                    <span className="text-white">
                      {row['First Name']} {row['Last name']}
                    </span>
                    <span className="text-gray-400">
                      {row['Departments'] || 'N/A'}
                    </span>
                  </div>
                ))}
                <p className="text-sm text-gray-400 pt-2 border-t border-gray-700">
                  Showing first 3 rows of {previewData.length} total rows
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                  }`}
              >
                <input {...getInputProps()} />
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  {isDragActive
                    ? 'Drop the CSV file here'
                    : 'Drag & drop a CSV file here, or click to select'}
                </p>
                <p className="text-sm text-gray-400">
                  Supports UTF-8 encoded CSV files
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  For best results, save your Excel file as "CSV UTF-8 (Comma delimited)"
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 bg-yellow-500/10 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium">Required Columns</p>
                <p className="text-sm text-gray-300 mt-1">
                  The CSV file must contain the following columns:
                </p>
                <ul className="text-sm text-gray-300 mt-1 list-disc list-inside">
                  {requiredColumns.map(col => (
                    <li key={col}>{col}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 p-6 border-t border-gray-800 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!previewData}
            className="btn-primary"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Data
          </button>
        </div>
      </div>
    </div>
  );
};