import React from 'react';
import { History, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface RecipeVersionBadgeProps {
  version: string;
  lastModified: string;
  isNew?: boolean;
  isModified?: boolean;
  className?: string;
}

export const RecipeVersionBadge: React.FC<RecipeVersionBadgeProps> = ({
  version,
  lastModified,
  isNew,
  isModified,
  className = ''
}) => {
  const getStatusColor = () => {
    if (isNew) return 'bg-green-500/20 text-green-400';
    if (isModified) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getStatusText = () => {
    if (isNew) return 'New';
    if (isModified) return 'Modified';
    return 'Current';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <History className="w-3 h-3" />
        v{version}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <AlertCircle className="w-3 h-3" />
        {format(new Date(lastModified), 'MMM d, yyyy')}
      </div>
    </div>
  );
};