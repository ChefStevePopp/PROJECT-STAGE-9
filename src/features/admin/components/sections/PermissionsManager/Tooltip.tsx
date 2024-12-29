import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  className = ''
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default: // top
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-gray-900';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-gray-900';
      default: // top
        return 'top-full left-1/2 -translate-x-1/2 border-t-gray-900';
    }
  };

  return (
    <div className={`group relative inline-flex ${className}`}>
      {children}
      <div className={`
        absolute ${getPositionClasses()}
        px-2 py-1 bg-gray-900 text-white text-xs rounded
        opacity-0 group-hover:opacity-100 transition-opacity
        whitespace-nowrap pointer-events-none z-50
      `}>
        {content}
        <div className={`
          absolute ${getArrowClasses()}
          border-4 border-transparent
        `} />
      </div>
    </div>
  );
};