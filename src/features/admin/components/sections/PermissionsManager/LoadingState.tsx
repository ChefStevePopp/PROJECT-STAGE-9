import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-primary-400" />
      </div>
      <div className="flex items-center gap-3 text-gray-400">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <p>Loading permissions...</p>
      </div>
    </div>
  );
};