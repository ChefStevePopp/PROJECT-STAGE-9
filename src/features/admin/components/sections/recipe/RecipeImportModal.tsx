import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { LoadingLogo } from '@/features/shared/components';
import { AllergenList } from '@/features/allergens/components';
import { useRecipeStore } from '@/stores/recipeStore';
import { parseRecipeCSV } from '@/lib/recipeImport';
import toast from 'react-hot-toast';

interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({ isOpen, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const { addRecipe } = useRecipeStore();

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

            const validRows = results.data.filter((row: any) => 
              Object.values(row).some(value => value && String(value).trim())
            );

            if (validRows.length === 0) {
              throw new Error('No valid data found in CSV file');
            }

            const recipe = parseRecipeCSV(validRows);
            setPreviewData([recipe]);
            setIsProcessing(false);
          } catch (error) {
            console.error('Error processing recipe:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to process recipe file');
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

  const handleImport = async () => {
    if (!previewData?.[0]) return;

    try {
      await addRecipe(previewData[0]);
      toast.success('Recipe imported successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to import recipe');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: files => files[0] && handleFileUpload(files[0])
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Import Recipe</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isProcessing ? (
            <LoadingLogo message="Processing recipe file..." />
          ) : previewData ? (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Recipe Preview</h3>
              <div className="bg-gray-800 rounded-lg p-6 space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white">{previewData[0].name}</h4>
                  <p className="text-gray-400 mt-1">{previewData[0].description}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Allergens</h5>
                  <AllergenList allergens={previewData[0].allergens} size="sm" />
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Ingredients</h5>
                  <ul className="space-y-1">
                    {previewData[0].ingredients.slice(0, 3).map((ingredient: any, index: number) => (
                      <li key={index} className="text-gray-300">
                        {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                      </li>
                    ))}
                    {previewData[0].ingredients.length > 3 && (
                      <li className="text-gray-400 italic">
                        +{previewData[0].ingredients.length - 3} more ingredients
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-2">Instructions</h5>
                  <ul className="space-y-1">
                    {previewData[0].instructions.slice(0, 2).map((instruction: string, index: number) => (
                      <li key={index} className="text-gray-300">
                        {index + 1}. {instruction}
                      </li>
                    ))}
                    {previewData[0].instructions.length > 2 && (
                      <li className="text-gray-400 italic">
                        +{previewData[0].instructions.length - 2} more steps
                      </li>
                    )}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Storage:</span>
                    <span className="text-white ml-2">
                      {previewData[0].container} ({previewData[0].containerType})
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Shelf Life:</span>
                    <span className="text-white ml-2">{previewData[0].shelfLife}</span>
                  </div>
                </div>
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
              </div>
            </div>
          )}

          <div className="mt-6 bg-yellow-500/10 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium">File Format Requirements</p>
                <ul className="text-sm text-gray-300 mt-1 list-disc list-inside space-y-1">
                  <li>Save as CSV UTF-8 (Comma delimited)</li>
                  <li>Ensure all text is properly encoded</li>
                  <li>Follow the standard recipe template format</li>
                  <li>Include all required columns and headers</li>
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
            Import Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeImportModal;