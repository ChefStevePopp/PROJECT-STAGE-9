import React, { useState, useRef, useEffect } from "react";
import { ArrowUpDown, Filter } from "lucide-react";
import type { ExcelColumn } from "@/types";

interface ResizableHeaderProps {
  column: ExcelColumn;
  onResize: (width: number) => void;
  onSort: () => void;
  sortDirection: "asc" | "desc" | null;
  isFiltered: boolean;
  onToggleFilter: () => void;
}

export const ResizableHeader: React.FC<ResizableHeaderProps> = ({
  column,
  onResize,
  onSort,
  sortDirection,
  isFiltered,
  onToggleFilter,
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
    >
      <div
        className="flex-1 flex items-center justify-between px-4 py-2"
        onClick={onSort}
      >
        <span className="font-medium text-gray-300">{column.name}</span>
        <div className="flex items-center">
          {sortDirection && (
            <ArrowUpDown
              className={`w-4 h-4 ${sortDirection === "asc" ? "text-primary-400" : "text-primary-400 transform rotate-180"}`}
            />
          )}
          {column.type !== "imageUrl" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFilter();
              }}
              className={`ml-2 ${isFiltered ? "text-primary-400" : "text-gray-500 hover:text-gray-300"}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
