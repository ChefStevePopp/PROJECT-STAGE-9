import React, { useState, createContext, useContext } from "react";

type TooltipContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("TooltipTrigger must be used within a Tooltip");
  }

  return (
    <div
      className="cursor-help"
      onMouseEnter={() => context.setOpen(true)}
      onMouseLeave={() => context.setOpen(false)}
    >
      {children}
    </div>
  );
};

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("TooltipContent must be used within a Tooltip");
  }

  if (!context.open) {
    return null;
  }

  return (
    <div className="absolute z-50 w-auto min-w-[8rem] px-3 py-1.5 text-sm bg-gray-800 rounded-lg shadow-lg -top-2 left-full ml-2 text-gray-200">
      {children}
    </div>
  );
};
