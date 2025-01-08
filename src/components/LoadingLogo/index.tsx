import React from "react";
import { ChefHat, AlertTriangle } from "lucide-react";

interface LoadingLogoProps {
  message?: string;
  error?: boolean;
  className?: string;
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({
  message = "Loading...",
  error = false,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative mb-4">
        {error ? (
          <AlertTriangle className="w-16 h-16 text-rose-500 animate-pulse" />
        ) : (
          <>
            <div className="absolute inset-0 animate-ping">
              <ChefHat className="w-16 h-16 text-primary-500/50" />
            </div>
            <ChefHat className="w-16 h-16 text-primary-500 relative" />
          </>
        )}
      </div>
      <div className="text-lg font-medium text-gray-400 animate-pulse">
        {message}
      </div>
      {error && (
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-rose-500/20 text-rose-400 rounded-lg hover:bg-rose-500/30 transition-colors"
        >
          Retry Connection
        </button>
      )}
    </div>
  );
};
