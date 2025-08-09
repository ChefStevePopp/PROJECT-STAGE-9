import React, { useEffect, useState } from "react";
import { ChefHat } from "lucide-react";

interface LoadingLogoProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({
  message = "Loading...",
  timeout,
  onTimeout,
}) => {
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (timeout && onTimeout) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
        onTimeout();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  // Show additional help text after timeout
  useEffect(() => {
    if (timeoutReached) {
      const helpTimer = setTimeout(() => {
        console.log(
          "LoadingLogo: Extended timeout reached, showing additional help",
        );
      }, 3000);

      return () => clearTimeout(helpTimer);
    }
  }, [timeoutReached]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 animate-ping">
          <ChefHat className="w-16 h-16 text-primary-500/50" />
        </div>
        <ChefHat className="w-16 h-16 text-primary-500 relative" />
      </div>
      <p className="text-lg font-medium text-gray-400 animate-pulse">
        {message}
      </p>
      {timeoutReached && (
        <div className="text-center mt-4 space-y-2">
          <p className="text-sm text-rose-400 animate-pulse">
            Taking longer than expected...
          </p>
          <p className="text-xs text-gray-500">
            If this continues, try refreshing the page
          </p>
        </div>
      )}
    </div>
  );
};
