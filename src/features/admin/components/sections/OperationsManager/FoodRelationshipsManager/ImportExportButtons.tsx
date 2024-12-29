import React, { useState } from 'react';
import { Upload, Download } from 'lucide-react';
import { ImportFoodRelationshipsModal } from '../ImportFoodRelationshipsModal';
import { generateFoodRelationshipsTemplate } from '@/utils/excel';

export const ImportExportButtons: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleDownloadTemplate = () => {
    try {
      generateFoodRelationshipsTemplate();
    } catch (error) {
      console.error('Error generating template:', error);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleDownloadTemplate}
        className="btn-ghost text-blue-400 hover:text-blue-300"
      >
        <Download className="w-5 h-5 mr-2" />
        Download Template
      </button>
      <button
        onClick={() => setIsImportModalOpen(true)}
        className="btn-primary"
      >
        <Upload className="w-5 h-5 mr-2" />
        Import Excel
      </button>

      <ImportFoodRelationshipsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};