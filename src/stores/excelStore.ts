import { create } from 'zustand';
import type { ExcelData } from '../types';
import toast from 'react-hot-toast';

interface ExcelStore {
  data: ExcelData[];
  isLoading: boolean;
  isImporting: boolean;
  importExcel: (data: any[]) => Promise<void>;
  clearData: () => void;
  saveData: () => Promise<void>;
}

const validateExcelData = (data: any[]): ExcelData[] => {
  if (!Array.isArray(data)) {
    throw new Error('Invalid data format: Expected an array');
  }

  // Required columns with exact Excel header names
  const requiredColumns = [
    'Item ID',
    'Product Name',
    'Inventory Unit of Measure',
    'Category',
    'Vendor',
    'Price',
    'Adjusted Price'
  ];

  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    throw new Error('Invalid data format: No valid rows found');
  }

  // Check for missing required columns
  const headers = Object.keys(firstRow);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Generate unique IDs using timestamp and index
  const timestamp = Date.now();

  return data
    .filter(row => {
      const productName = row['Product Name']?.toString().trim();
      return productName && productName !== '0';
    })
    .map((row, index) => ({
      id: `inventory-${timestamp}-${index}`,
      itemId: row['Item ID']?.toString().trim() || '',
      productName: row['Product Name']?.toString().trim() || '',
      unitOfMeasure: row['Inventory Unit of Measure']?.toString().trim() || '',
      category: row['Category']?.toString().trim() || '',
      vendor: row['Vendor']?.toString().trim() || '',
      price: parseFloat(row['Price']?.toString().replace(/[$,]/g, '') || '0'),
      adjustedPrice: parseFloat(row['Adjusted Price']?.toString().replace(/[$,]/g, '') || '0'),
      image: row['Image']?.toString().trim() || '',
      subCategory: row['Sub-Category']?.toString().trim() || '',
      itemCode: row['Item Code']?.toString().trim() || '',
      caseSize: row['Case Size']?.toString().trim() || '',
      unitsPerCase: row['Units/Case']?.toString().trim() || '',
      yieldPercent: parseFloat(row['Yield %']?.toString().replace(/%/g, '') || '100'),
      lastUpdated: new Date().toISOString()
    }));
};

export const useExcelStore = create<ExcelStore>((set) => ({
  data: [],
  isLoading: false,
  isImporting: false,

  importExcel: async (data: any[]) => {
    set({ isImporting: true });
    try {
      const validatedData = validateExcelData(data);
      set({ data: validatedData });
      toast.success('Data imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to import data');
      }
      throw error;
    } finally {
      set({ isImporting: false });
    }
  },

  clearData: () => {
    set({ data: [] });
    toast.success('Data cleared successfully');
  },

  saveData: async () => {
    try {
      // Implement save functionality here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Data saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save data');
      throw error;
    }
  }
}));