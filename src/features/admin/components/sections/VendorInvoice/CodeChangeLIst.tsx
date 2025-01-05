import React from 'react';
import type { CodeChange } from '@/types/vendor-invoice';

interface CodeChangesListProps {
  changes: CodeChange[];
  onUpdateCode: (change: CodeChange) => void;
  onCreateNewItem: (change: CodeChange) => void;
}

export const CodeChangesList: React.FC<CodeChangesListProps> = ({
  changes,
  onUpdateCode,
  onCreateNewItem
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium text-white">Item Code Changes</h3>
    {changes.map((change, index) => (
      <div key={index} className="p-4 bg-amber-500/10 rounded-lg">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-white">{change.productName}</h4>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-gray-400">Old Code: {change.oldCode}</span>
              <span className="text-gray-400">→</span>
              <span className="text-amber-400">New Code: {change.newCode}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdateCode(change)}
              className="btn-ghost text-sm text-amber-400 hover:text-amber-300"
            >
              Update Code
            </button>
            <button
              onClick={() => onCreateNewItem(change)}
              className="btn-ghost text-sm text-gray-400 hover:text-white"
            >
              New Item
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);