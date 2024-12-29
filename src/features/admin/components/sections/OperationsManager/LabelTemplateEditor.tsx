import React, { useState } from 'react';
import { Save, X, Eye, Printer, AlertTriangle } from 'lucide-react';
import type { LabelTemplate } from '../../types/labels';
import toast from 'react-hot-toast';

interface LabelTemplateEditorProps {
  template: LabelTemplate;
  onUpdate: (updatedTemplate: LabelTemplate) => void;
}

const AVAILABLE_FIELDS = [
  { id: 'product_name', label: 'Product Name', required: true },
  { id: 'date', label: 'Date', required: true },
  { id: 'team_member', label: 'Team Member', required: true },
  { id: 'use_by', label: 'Use By Date' },
  { id: 'allergens', label: 'Allergen Warnings' },
  { id: 'storage_temp', label: 'Storage Temperature' },
  { id: 'batch_number', label: 'Batch Number' }
];

export const LabelTemplateEditor: React.FC<LabelTemplateEditorProps> = ({ 
  template, 
  onUpdate 
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFieldToggle = (fieldId: string) => {
    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
    if (field?.required) return; // Can't toggle required fields

    const updatedFields = template.fields.includes(fieldId)
      ? template.fields.filter(f => f !== fieldId)
      : [...template.fields, fieldId];

    onUpdate({
      ...template,
      fields: updatedFields
    });
  };

  const renderPreview = () => {
    return (
      <div className="bg-white text-black p-4 rounded-lg w-[248px]"> {/* 62mm = ~248px */}
        <div className="text-xs border-b pb-1 mb-2 font-bold">
          Memphis Fire BBQ Company
        </div>
        <div className="space-y-1">
          {template.fields.map(fieldId => {
            const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
            return (
              <div key={fieldId} className="text-sm flex justify-between">
                <span className="text-gray-600">{field?.label}:</span>
                <span className="font-mono">_______</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <input
            type="text"
            value={template.name}
            onChange={(e) => onUpdate({ ...template, name: e.target.value })}
            className="input text-xl font-bold bg-transparent"
            placeholder="Template Name"
          />
          <div className="text-sm text-gray-400 mt-1">
            {template.printerConfig?.width}mm x {template.printerConfig?.height}mm
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="btn-ghost"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </button>
          <button className="btn-primary">
            <Printer className="w-4 h-4 mr-2" />
            Test Print
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 gap-8">
        {/* Field Selection */}
        <div className={isPreviewMode ? 'opacity-50 pointer-events-none' : ''}>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Label Fields</h4>
          <div className="space-y-2">
            {AVAILABLE_FIELDS.map(field => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={template.fields.includes(field.id)}
                    onChange={() => handleFieldToggle(field.id)}
                    disabled={field.required}
                    className="rounded border-gray-600"
                  />
                  <span className="text-gray-200">{field.label}</span>
                  {field.required && (
                    <span className="text-xs text-rose-400">Required</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Required Fields Warning */}
          <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                Required fields cannot be removed from the label template for food safety compliance.
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-4">Label Preview</h4>
          {renderPreview()}
          <p className="text-sm text-gray-500 mt-4">
            Preview shows approximate layout. Actual label may vary slightly.
          </p>
        </div>
      </div>
    </div>
  );
};