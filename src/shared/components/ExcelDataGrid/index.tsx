import React from "react";
import { AllergenCell } from "@/features/admin/components/sections/recipe/MasterIngredientList/components/AllergenCell";

interface Column<T> {
  key: keyof T;
  header: string;
  enableSorting?: boolean;
  cell?: (
    value: any,
    row: T,
  ) => React.ReactNode | { type: string; ingredient: T };
}

interface ExcelDataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export function ExcelDataGrid<T>({
  data,
  columns,
  onRowClick,
}: ExcelDataGridProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const renderCell = (column: Column<T>, row: T) => {
    if (column.cell) {
      const cellContent = column.cell(row[column.key], row);
      if (
        typeof cellContent === "object" &&
        cellContent !== null &&
        "type" in cellContent
      ) {
        if (cellContent.type === "allergen-cell") {
          return <AllergenCell ingredient={cellContent.ingredient} />;
        }
      }
      return cellContent;
    }
    return row[column.key];
  };

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() =>
                    column.enableSorting && requestSort(column.key)
                  }
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-400 ${column.enableSorting ? "cursor-pointer select-none" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.enableSorting && sortConfig.key === column.key && (
                      <span className="text-gray-500">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-gray-700 hover:bg-gray-800/50 ${onRowClick ? "cursor-pointer" : ""}`}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-4 py-3 text-sm text-gray-300"
                  >
                    {renderCell(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
