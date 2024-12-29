import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="cursor-help">{children}</div>;
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="absolute z-50 w-64 px-4 py-2 text-sm bg-gray-800 rounded-lg shadow-lg -top-2 left-full ml-2">
      {children}
    </div>
  );
};