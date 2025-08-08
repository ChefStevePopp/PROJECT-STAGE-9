import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <div className="text-center">
        <h3 className="text-lg font-medium text-white mb-2">Error</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
