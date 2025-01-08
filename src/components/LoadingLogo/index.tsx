import React from "react";
import { ChefHat, AlertTriangle } from "lucide-react";

type LoadingLogoProps = {
  message?: string;
  error?: boolean;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children">;

export const LoadingLogo = React.forwardRef<HTMLDivElement, LoadingLogoProps>(
  (
    { message = "Loading...", error = false, className = "", ...divProps },
    ref,
  ) => {
    // Add debug logging
    console.log("LoadingLogo rendered with message:", message, "error:", error);

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center ${className}`}
        {...divProps}
      >
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
  },
);

LoadingLogo.displayName = "LoadingLogo";
