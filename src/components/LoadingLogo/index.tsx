import React, { useEffect, useState } from "react";
import { ChefHat, AlertTriangle, RefreshCw } from "lucide-react";

interface LoadingLogoProps {
  message?: string;
  error?: boolean;
  className?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({
  message = "Loading...",
  error = false,
  className = "",
  timeout = 10000, // 10 second default timeout
  onTimeout,
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!error && timeout > 0) {
      const timer = setTimeout(() => {
        setHasTimedOut(true);
        onTimeout?.();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [error, timeout, onTimeout]);

  if (error || hasTimedOut) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="relative mb-4">
          <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
        </div>
        <div className="text-lg font-medium text-gray-400 mb-4">
          {error ? message : "Taking longer than expected..."}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-4">
        <div className="absolute inset-0 animate-ping">
          <ChefHat className="w-16 h-16 text-primary-500/50" />
        </div>
        <ChefHat className="w-16 h-16 text-primary-500 relative" />
      </div>
      <div className="text-lg font-medium text-gray-400 animate-pulse">
        {message}
      </div>
    </div>
  );
};
