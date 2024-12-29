import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const FifoWarning: React.FC = () => {
  return (
    <div className="bg-yellow-500/10 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
        <div>
          <p className="text-yellow-400 font-medium">FIFO Compliance Required</p>
          <p className="text-sm text-gray-300 mt-1">
            This item must be stored following First In, First Out principles.
            Always rotate stock and use oldest product first.
          </p>
        </div>
      </div>
    </div>
  );
};