import React from 'react';
import { History } from 'lucide-react';
import type { PriceChange } from '@/types/vendor-invoice';

interface PriceChangeCardProps {
  change: PriceChange;
  onApprove: () => void;
  onReject: () => void;
  showHistory: () => void;
}

export const PriceChangeCard: React.FC<PriceChangeCardProps> = ({
  change,
  onApprove,
  onReject,
  showHistory
}) => (
  <div className="bg-gray-800/50 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white">{change.productName}</h3>
          {Math.abs(change.percentChange) > 10 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
              Significant Change
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-gray-400">
            Old: ${change.oldPrice.toFixed(2)}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-white">
            New: ${change.newPrice.toFixed(2)}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
            ${Math.abs(change.percentChange) > 10
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {change.percentChange > 0 ? '+' : ''}
            {change.percentChange.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={showHistory}
          className="btn-ghost text-gray-400 hover:text-white"
        >
          <History className="w-4 h-4" />
        </button>
        <button
          onClick={onReject}
          className="btn-ghost text-rose-400 hover:text-rose-300"
        >
          Reject
        </button>
        <button
          onClick={onApprove}
          className="btn-ghost text-emerald-400 hover:text-emerald-300"
        >
          Approve
        </button>
      </div>
    </div>
  </div>
);