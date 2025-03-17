import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, Filter } from "lucide-react";
import type { ExcelColumn } from "@/types";

interface ResizableHeaderProps {
  column: ExcelColumn;
  onResize: (width: number) => void;
  onSort: () => void;
  sortDirection: "asc" | "desc" | null;
  isFiltered: boolean;
  onToggleFilter: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: () => void;
}

export const ResizableHeader: React.FC<ResizableHeaderProps> = ({
  column,
  onResize,
  onSort,
  sortDirection,
  isFiltered,
  onToggleFilter,
  onDragStart,
  onDragEnd,
  onDragOver,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = headerRef.current?.offsetWidth || column.width;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const width = startWidthRef.current + (e.clientX - startXRef.current);
    if (width >= 50) {
      // Minimum width
      onResize(width);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={headerRef}
      className="relative flex items-center h-full cursor-pointer select-none"
      style={{ width: `${column.width}px` }}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div
        className="flex-1 flex items-center justify-between px-4 py-2"
        onClick={onSort}
      >
        <span className="font-medium text-gray-300">{column.name}</span>
        <div className="flex items-center">
          {sortDirection === "asc" && (
            <ArrowUp className="w-4 h-4 text-primary-400" />
          )}
          {sortDirection === "desc" && (
            <ArrowDown className="w-4 h-4 text-primary-400" />
          )}
          {/* Filter icons removed as requested */}
        </div>
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
