import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { read, utils } from 'xlsx';
import { LoadingLogo } from '@/features/shared/components';
import { useFoodRelationshipsStore } from '@/stores/foodRelationshipsStore';
import toast from 'react-hot-toast';

interface ImportFoodRelationshipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default icons and colors for major groups
const MAJOR_GROUP_DEFAULTS = {
  'Food': { icon: 'Package', color: 'primary' },
  'Beverage': { icon: 'Coffee', color: 'amber' },
  'Alcohol': { icon: 'Wine', color: 'rose' },
  'Supplies': { icon: 'Box', color: 'purple' }
} as const;

// Color palette for dynamic assignment
const COLOR_PALETTE = [
  'primary',
  'amber',
  'rose',
  'purple',
  'green',
  'blue',
  'indigo',
  'pink'
] as const;

// Icon palette for dynamic assignment
const ICON_PALETTE = [
  'Package',
  'Box',
  'Archive',
  'Boxes',
  'Container',
  'Crate',
  'Cube',
  'Package2'
] as const;

export const ImportFoodRelationshipsModal: React.FC<ImportFoodRelationshipsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [workbook, setWorkbook] = useState<any>(null);
  const [selectedSheet, setSelectedSheet] = useState('');

  const { addGroup, addCategory, addSubCategory } = useFoodRelationshipsStore();

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setCurrentOperation('Reading file...');

    try {
      // Simulate progress for file reading
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { cellDates: true, cellNF: false, cellText: false });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setCurrentOperation('File processed successfully');
      
      setTimeout(() => {
        setWorkbook(wb);
        setSelectedSheet('');
        setPreviewData(null);
        setIsProcessing(false);
        setUploadProgress(0);
        setCurrentOperation('');
      }, 500);
    } catch (error) {
      console.error('Error reading Excel:', error);
      toast.error('Failed to read Excel file');
      setIsProcessing(false);
      setUploadProgress(0);
      setCurrentOperation('');
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (!workbook || !sheetName) return;
    
    try {
      setIsProcessing(true);
      setCurrentOperation('Processing worksheet...');
      
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = utils.sheet_to_json(worksheet, {
        header: ['majorGroup', 'category', 'subCategory', 'description'],
        range: 1,
        raw: false,
        defval: ''
      });

      const validRows = jsonData.filter(row => {
        const majorGroup = row.majorGroup?.toString().trim();
        const category = row.category?.toString().trim();
        const subCategory = row.subCategory?.toString().trim();
        return majorGroup && category && subCategory;
      });

      if (validRows.length === 0) {
        toast.error('No valid data rows found in selected sheet');
        setPreviewData(null);
        setSelectedSheet('');
        return;
      }

      setSelectedSheet(sheetName);
      setPreviewData(validRows.slice(0, 5));
    } catch (error) {
      console.error('Error loading sheet:', error);
      toast.error('Failed to load sheet data');
      setPreviewData(null);
      setSelectedSheet('');
    } finally {
      setIsProcessing(false);
      setCurrentOperation('');
    }
  };

  const getGroupStyle = (groupName: string) => {
    // Use predefined styles if available
    if (groupName in MAJOR_GROUP_DEFAULTS) {
      return MAJOR_GROUP_DEFAULTS[groupName as keyof typeof MAJOR_GROUP_DEFAULTS];
    }

    // Generate deterministic index based on group name
    const hash = groupName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Get color and icon from palettes
    const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
    const iconIndex = Math.abs(hash) % ICON_PALETTE.length;

    return {
      color: COLOR_PALETTE[colorIndex],
      icon: ICON_PALETTE[iconIndex]
    };
  };

  const handleImport = async () => {
    if (!workbook || !selectedSheet) {
      toast.error('Please select a worksheet first');
      return;
    }

    try {
      setIsProcessing(true);
      setUploadProgress(0);
      
      const worksheet = workbook.Sheets[selectedSheet];
      const jsonData = utils.sheet_to_json(worksheet, {
        header: ['majorGroup', 'category', 'subCategory', 'description'],
        range: 1,
        raw: false,
        defval: ''
      });

      // Track created groups and categories
      const groupMap = new Map();
      const categoryMap = new Map();

      // Calculate total operations
      const totalOperations = jsonData.length * 3; // Groups, categories, and subcategories
      let completedOperations = 0;

      // Process major groups first
      setCurrentOperation('Creating major groups...');
      for (const row of jsonData) {
        const majorGroup = row.majorGroup?.toString().trim();
        if (!majorGroup) continue;

        if (!groupMap.has(majorGroup)) {
          const { icon, color } = getGroupStyle(majorGroup);

          const group = await addGroup({
            name: majorGroup,
            description: `${majorGroup} category group`,
            icon,
            color,
            sortOrder: groupMap.size
          });
          groupMap.set(majorGroup, group.id);
        }
        completedOperations++;
        setUploadProgress((completedOperations / totalOperations) * 100);
      }

      // Process categories
      setCurrentOperation('Creating categories...');
      for (const row of jsonData) {
        const majorGroup = row.majorGroup?.toString().trim();
        const category = row.category?.toString().trim();
        if (!majorGroup || !category) continue;

        const groupId = groupMap.get(majorGroup);
        if (!groupId) {
          console.warn(`Parent group "${majorGroup}" not found for category "${category}"`);
          continue;
        }

        const categoryKey = `${majorGroup}:${category}`;
        if (!categoryMap.has(categoryKey)) {
          const cat = await addCategory({
            groupId,
            name: category,
            description: `${category} under ${majorGroup}`,
            sortOrder: categoryMap.size
          });
          categoryMap.set(categoryKey, cat.id);
        }
        completedOperations++;
        setUploadProgress((completedOperations / totalOperations) * 100);
      }

      // Process sub-categories
      setCurrentOperation('Creating sub-categories...');
      for (const row of jsonData) {
        const majorGroup = row.majorGroup?.toString().trim();
        const category = row.category?.toString().trim();
        const subCategory = row.subCategory?.toString().trim();
        const description = row.description?.toString().trim();
        
        if (!majorGroup || !category || !subCategory) continue;

        const categoryKey = `${majorGroup}:${category}`;
        const categoryId = categoryMap.get(categoryKey);
        if (!categoryId) {
          console.warn(`Parent category "${category}" not found for sub-category "${subCategory}"`);
          continue;
        }

        await addSubCategory({
          categoryId,
          name: subCategory,
          description: description || `${subCategory} under ${category}`,
          sortOrder: 0
        });
        completedOperations++;
        setUploadProgress((completedOperations / totalOperations) * 100);
      }

      toast.success('Food relationships imported successfully');
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import food relationships');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setCurrentOperation('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm']
    },
    maxFiles: 1,
    onDrop: files => files[0] && handleFileUpload(files[0])
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Import Food Relationships</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {isProcessing ? (
            <div className="space-y-4">
              <LoadingLogo message={currentOperation || 'Processing...'} />
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary-500 h-full transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : workbook ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Worksheet
                </label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose a worksheet...</option>
                  {workbook.SheetNames.map((name: string) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {previewData && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Data Preview</h3>
                  <div className="bg-gray-800 rounded-lg p-4 space-y-4">
                    {previewData.map((row, index) => (
                      <div key={index} className="flex gap-4 text-sm">
                        <span className="text-gray-400 w-24">
                          {row.majorGroup}
                        </span>
                        <span className="text-white flex-1">
                          {row.category} → {row.subCategory}
                        </span>
                      </div>
                    ))}
                    <p className="text-sm text-gray-400 pt-2 border-t border-gray-700">
                      Showing first 5 rows of {previewData.length} total rows
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isDragActive 
                  ? 'border-primary-500 bg-primary-500/10' 
                  : 'border-gray-700 hover:border-gray-600'
                }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {isDragActive
                  ? 'Drop the Excel file here'
                  : 'Drag & drop an Excel file here, or click to select'}
              </p>
              <p className="text-sm text-gray-400">
                Supports .xlsx and .xlsm files
              </p>
            </div>
          )}

          <div className="mt-6 bg-yellow-500/10 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-medium">Required Columns</p>
                <p className="text-sm text-gray-300 mt-1">
                  The Excel file must contain the following columns:
                </p>
                <ul className="text-sm text-gray-300 mt-1 list-disc list-inside">
                  <li>Major Group (Food, Beverage, Alcohol, etc)</li>
                  <li>Category (e.g., Proteins, Hot Beverages, Beer)</li>
                  <li>Sub Category (e.g., Beef, Coffee, Draft Beer)</li>
                  <li>Sub Category Description</li>
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
            disabled={!workbook || !selectedSheet || !previewData || isProcessing}
            className="btn-primary relative"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Import Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};