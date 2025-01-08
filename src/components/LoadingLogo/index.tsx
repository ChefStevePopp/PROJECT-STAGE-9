import React from "react";
import { ChefHat } from "lucide-react";

interface LoadingLogoProps {
  message?: string;
  className?: string;
}

export const LoadingLogo = React.forwardRef<HTMLDivElement, LoadingLogoProps>(
  ({ message = "Loading...", className }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center ${className || ""}`}
      >
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
  },
);

LoadingLogo.displayName = "LoadingLogo";
