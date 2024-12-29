import React from 'react';
import * as Icons from 'lucide-react';
import { ALLERGENS, SEVERITY_COLORS } from '../constants';
import type { AllergenType } from '../types';

interface AllergenBadgeProps {
  type: AllergenType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const AllergenBadge: React.FC<AllergenBadgeProps> = ({
  type,
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const allergen = ALLERGENS[type];
  if (!allergen) return null;

  const Icon = Icons[allergen.icon as keyof typeof Icons];
  if (!Icon) return null;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const severityColor = SEVERITY_COLORS[allergen.severity];

  return (
    <div className={`group relative inline-flex items-center ${className}`}>
      <div className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        bg-${allergen.color}-500/20
        text-${allergen.color}-400
        transition-transform
        hover:scale-110
        cursor-help
      `}>
        <Icon className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>
      
      {showLabel && (
        <span className="ml-2 text-sm text-gray-300">
          {allergen.label}
        </span>
      )}
      
      {/* Tooltip */}
      <div className="
        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        px-3 py-2 rounded bg-gray-800
        text-white text-xs
        whitespace-nowrap
        opacity-0 group-hover:opacity-100
        transition-opacity
        pointer-events-none
        z-10
      ">
        <div className="font-medium mb-1 flex items-center gap-2">
          {allergen.label}
          <span className={`px-1.5 py-0.5 rounded-full text-xs bg-${severityColor}-500/20 text-${severityColor}-400`}>
            {allergen.severity}
          </span>
        </div>
        <p className="text-gray-300 text-xs">{allergen.description}</p>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                      border-4 border-transparent border-t-gray-800" />
      </div>
    </div>
  );
};