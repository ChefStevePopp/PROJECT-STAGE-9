import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-red-400 mb-4">{message}</p>
      <button 
        onClick={onRetry}
        className="btn-ghost text-primary-400 flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
};