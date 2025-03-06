import React from "react";
import { Search, X } from "lucide-react";
import type { ExcelColumn } from "@/types";

interface ColumnFilterProps {
  column: ExcelColumn;
  value: string | number | [number, number] | [string, string] | null;
  onChange: (value: any) => void;
  onClear: () => void;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
  column,
  value,
  onChange,
  onClear,
}) => {
  const renderFilterInput = () => {
    switch (column.type) {
      case "text":
        return (
          <div className="relative">
            <input
              type="text"
              value={(value as string) || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Filter ${column.name}...`}
              className="input w-full pl-8 py-1 text-sm"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            {value && (
              <button
                onClick={onClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case "number":
      case "currency":
        return (
          <div className="flex space-x-2">
            <input
              type="number"
              value={(value as [number, number])?.[0] || ""}
              onChange={(e) => {
                const min =
                  e.target.value === "" ? null : Number(e.target.value);
                const max = (value as [number, number])?.[1] || null;
                onChange([min, max]);
              }}
              placeholder="Min"
              className="input w-full py-1 text-sm"
            />
            <input
              type="number"
              value={(value as [number, number])?.[1] || ""}
              onChange={(e) => {
                const min = (value as [number, number])?.[0] || null;
                const max =
                  e.target.value === "" ? null : Number(e.target.value);
                onChange([min, max]);
              }}
              placeholder="Max"
              className="input w-full py-1 text-sm"
            />
            {value && (
              <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      case "date":
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              value={(value as [string, string])?.[0] || ""}
              onChange={(e) => {
                const start = e.target.value;
                const end = (value as [string, string])?.[1] || "";
                onChange([start, end]);
              }}
              className="input w-full py-1 text-sm"
            />
            <input
              type="date"
              value={(value as [string, string])?.[1] || ""}
              onChange={(e) => {
                const start = (value as [string, string])?.[0] || "";
                const end = e.target.value;
                onChange([start, end]);
              }}
              className="input w-full py-1 text-sm"
            />
            {value && (
              <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="py-2">{renderFilterInput()}</div>;
};
