import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <p className="text-red-400 mb-4">{error}</p>
      <button 
        onClick={onRetry}
        className="btn-ghost text-primary-400"
      >
        Try Again
      </button>
    </div>
  );
};