import React from 'react';
import { ChefHat } from 'lucide-react';

interface LoadingLogoProps {
  message?: string;
}

export const LoadingLogo: React.FC<LoadingLogoProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <div className="absolute inset-0 animate-ping">
          <ChefHat className="w-16 h-16 text-primary-500/50" />
        </div>
        <ChefHat className="w-16 h-16 text-primary-500 relative" />
      </div>
      <p className="text-lg font-medium text-gray-400 animate-pulse">{message}</p>
    </div>
  );
};