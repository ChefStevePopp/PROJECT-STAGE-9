import React from 'react';
import { Package } from 'lucide-react';
import { LoadingLogo } from '@/features/shared/components';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingLogo message="Loading food relationships..." />
    </div>
  );
};