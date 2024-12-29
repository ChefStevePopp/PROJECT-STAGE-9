import React from 'react';
import { Package, ArrowRight, FileSpreadsheet, Upload, Download } from 'lucide-react';

interface WelcomeScreenProps {
  onImport: () => void;
  onDownloadTemplate: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onImport, onDownloadTemplate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
        <Package className="w-8 h-8 text-amber-400" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">Welcome to Food Inventory</h2>
      <p className="text-gray-400 text-center max-w-lg mb-8">
        Track your inventory levels, monitor costs, and manage stock efficiently. 
        Get started by importing your existing inventory data.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Download Template */}
        <div className="card p-6 hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={onDownloadTemplate}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Download className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Download Template</h3>
              <p className="text-sm text-gray-400">Get our Excel template</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel template with required columns</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span>Fill in your inventory data</span>
            </div>
          </div>
        </div>

        {/* Import Data */}
        <div className="card p-6 hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={onImport}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Import Data</h3>
              <p className="text-sm text-gray-400">Upload your inventory data</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Import from Excel spreadsheet</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span>Quick and easy setup</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-500/10 rounded-lg max-w-3xl">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="text-amber-400 font-medium mb-1">Getting Started</h4>
            <p className="text-sm text-gray-300">
              Start by downloading our Excel template. Fill in your current inventory data, then import it back into the system. 
              Your inventory data will be automatically linked to your master ingredients for accurate tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};