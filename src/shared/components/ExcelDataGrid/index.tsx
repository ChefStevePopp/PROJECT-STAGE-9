import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  Download,
  Settings,
  Eye,
  ArrowsMaximize,
  RefreshCw,
} from "lucide-react";
import type { ExcelColumn } from "@/types/excel";
import { PaginationControls } from "./PaginationControls";
import { ColumnFilter } from "./ColumnFilter";
import { ResizableHeader } from "./ResizableHeader";
import { AllergenCell } from "@/features/admin/components/sections/recipe/MasterIngredientList/components/AllergenCell";
import { PriceChangeCell } from "@/features/admin/components/sections/VendorInvoice/components/PriceHistory/PriceChangeCell";

interface ExcelDataGridProps<T> {
  columns: ExcelColumn[];
  data: T[];
  categoryFilter?: string;
  onCategoryChange?: (category: string) => void;
  type?: string;
  onRowClick?: (row: T) => void;
  onRefresh?: () => void;
}

// Helper to get nested value from object
const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

export function ExcelDataGrid<T>({
  columns,
  data,
  categoryFilter = "all",
  onCategoryChange,
  type = "default",
  onRowClick,
  onRefresh,
}: ExcelDataGridProps<T>) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );

  // Filtering state
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  // Column customization
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
    () => {
      // Try to load from localStorage
      const savedWidths = localStorage.getItem(`excel-grid-widths-${type}`);
      return savedWidths ? JSON.parse(savedWidths) : {};
    },
  );
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    // Try to load from localStorage
    const savedColumns = localStorage.getItem(`excel-grid-columns-${type}`);
    return savedColumns
      ? JSON.parse(savedColumns)
      : columns.map((col) => col.key);
  });
  // Column order state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    // Try to load from localStorage
    const savedOrder = localStorage.getItem(`excel-grid-order-${type}`);
    return savedOrder ? JSON.parse(savedOrder) : columns.map((col) => col.key);
  });
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [draggingColumn, setDraggingColumn] = useState<string | null>(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, globalFilter, categoryFilter]);

  // Initialize columns when columns change
  useEffect(() => {
    const columnKeys = columns.map((col) => col.key);
    setVisibleColumns(columnKeys);

    // Only reset column order if we don't have a saved order or if new columns are added
    setColumnOrder((prev) => {
      // If we have new columns that aren't in the current order, add them to the end
      const newColumns = columnKeys.filter((key) => !prev.includes(key));
      if (newColumns.length > 0) {
        const updatedOrder = [
          ...prev.filter((key) => columnKeys.includes(key)),
          ...newColumns,
        ];
        localStorage.setItem(
          `excel-grid-order-${type}`,
          JSON.stringify(updatedOrder),
        );
        return updatedOrder;
      }
      // Otherwise filter out any columns that no longer exist
      const filteredOrder = prev.filter((key) => columnKeys.includes(key));
      if (filteredOrder.length !== prev.length) {
        localStorage.setItem(
          `excel-grid-order-${type}`,
          JSON.stringify(filteredOrder),
        );
        return filteredOrder;
      }
      return prev;
    });
  }, [columns, type]);

  // Apply all filters and sorting to data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply category filter if provided
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter((item) => {
        const category = (item as any).ingredient?.category || "";
        return category === categoryFilter;
      });
    }

    // Apply global filter
    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase();
      result = result.filter((item) => {
        return columns.some((column) => {
          const value = getNestedValue(item, column.key);
          if (value == null) return false;
          return String(value).toLowerCase().includes(lowercasedFilter);
        });
      });
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (!filterValue) return;

      const column = columns.find((col) => col.key === key);
      if (!column) return;

      result = result.filter((item) => {
        const value = getNestedValue(item, key);
        if (value == null) return false;

        switch (column.type) {
          case "text":
            return String(value)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());

          case "number":
          case "currency":
            const [min, max] = filterValue as [number | null, number | null];
            if (min !== null && value < min) return false;
            if (max !== null && value > max) return false;
            return true;

          case "date":
            const [startDate, endDate] = filterValue as [string, string];
            const dateValue = new Date(value);
            if (startDate && new Date(startDate) > dateValue) return false;
            if (endDate && new Date(endDate) < dateValue) return false;
            return true;

          default:
            return true;
        }
      });
    });

    // Apply sorting
    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = getNestedValue(a, sortColumn);
        const bValue = getNestedValue(b, sortColumn);

        if (aValue == null) return sortDirection === "asc" ? -1 : 1;
        if (bValue == null) return sortDirection === "asc" ? 1 : -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortDirection === "asc"
          ? aValue > bValue
            ? 1
            : -1
          : aValue > bValue
            ? -1
            : 1;
      });
    }

    return result;
  }, [
    data,
    columns,
    categoryFilter,
    globalFilter,
    filters,
    sortColumn,
    sortDirection,
  ]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  // Handle column resize
  const handleColumnResize = (columnKey: string, width: number) => {
    setColumnWidths((prev) => {
      const newWidths = {
        ...prev,
        [columnKey]: width,
      };
      // Save to localStorage
      localStorage.setItem(
        `excel-grid-widths-${type}`,
        JSON.stringify(newWidths),
      );
      return newWidths;
    });
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      let newColumns;
      if (prev.includes(columnKey)) {
        newColumns = prev.filter((key) => key !== columnKey);
      } else {
        newColumns = [...prev, columnKey];
      }
      // Save to localStorage
      localStorage.setItem(
        `excel-grid-columns-${type}`,
        JSON.stringify(newColumns),
      );
      return newColumns;
    });
  };

  // Handle filter change
  const handleFilterChange = (columnKey: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));

    if (value && !activeFilters.includes(columnKey)) {
      setActiveFilters((prev) => [...prev, columnKey]);
    } else if (!value && activeFilters.includes(columnKey)) {
      setActiveFilters((prev) => prev.filter((key) => key !== columnKey));
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters([]);
    setGlobalFilter("");
  };

  // Render cell content based on column type
  const renderCellContent = (item: any, column: ExcelColumn) => {
    const value = getNestedValue(item, column.key);
    if (value == null) return "-";

    switch (column.type) {
      case "currency":
        return `${Number(value).toFixed(2)}`;

      case "date":
        return new Date(value).toLocaleDateString();

      case "percent":
        return `${Number(value).toFixed(1)}%`;

      case "imageUrl":
        return value ? (
          <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800">
            <img
              src={value}
              alt="Thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/40?text=N/A";
              }}
            />
          </div>
        ) : (
          "-"
        );

      case "boolean":
        return value ? "Yes" : "No";

      default:
        return String(value);
    }
  };

  const renderCell = (column: ExcelColumn, row: T) => {
    // Check if there's a custom cell renderer for this column
    if (column.type === "allergen") {
      return <AllergenCell ingredient={row} />;
    }

    if (column.type === "percent" && column.key === "change_percent") {
      return <PriceChangeCell value={getNestedValue(row, column.key)} />;
    }

    return renderCellContent(row, column);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex-1 flex items-center gap-2">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`btn-ghost ${activeFilters.length > 0 ? "text-primary-400" : ""}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
          </button>

          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="btn-ghost"
          >
            <Settings className="w-4 h-4 mr-2" />
            Columns
          </button>

          <button className="btn-ghost">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn-ghost flex items-center gap-1"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          )}
        </div>
      </div>
      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="card p-4 bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Filters</h3>
            <div className="flex gap-2">
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Clear all filters
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns
              .filter(
                (col) => col.type !== "imageUrl" && col.type !== "allergen",
              )
              .map((column) => (
                <div key={column.key} className="space-y-1">
                  <label className="text-sm text-gray-400">{column.name}</label>
                  <ColumnFilter
                    column={column}
                    value={filters[column.key] || null}
                    onChange={(value) => handleFilterChange(column.key, value)}
                    onClear={() => handleFilterChange(column.key, null)}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Column Settings Panel */}
      {showColumnSettings && (
        <div className="card p-4 bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Column Settings</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setColumnWidths({});
                  localStorage.removeItem(`excel-grid-widths-${type}`);
                }}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reset widths
              </button>
              <button
                onClick={() => {
                  const allColumns = columns.map((col) => col.key);
                  setVisibleColumns(allColumns);
                  localStorage.setItem(
                    `excel-grid-columns-${type}`,
                    JSON.stringify(allColumns),
                  );
                }}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Show all
              </button>
              <button
                onClick={() => {
                  // Reset column order to default (same as columns array)
                  const defaultOrder = columns.map((col) => col.key);
                  setColumnOrder(defaultOrder);
                  localStorage.setItem(
                    `excel-grid-order-${type}`,
                    JSON.stringify(defaultOrder),
                  );
                }}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Reset order
              </button>
              <button
                onClick={() => setShowColumnSettings(false)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="text-sm text-gray-400 mb-2">
              <p>
                Drag and drop column headers to reorder columns. Check/uncheck
                to show/hide columns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.map((column) => (
                <div key={column.key} className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`col-visible-${column.key}`}
                        checked={visibleColumns.includes(column.key)}
                        onChange={() => toggleColumnVisibility(column.key)}
                        className="mr-2"
                      />
                      <label
                        htmlFor={`col-visible-${column.key}`}
                        className="text-sm text-gray-300"
                      >
                        {column.name}
                      </label>
                    </div>
                  </div>

                  {visibleColumns.includes(column.key) && (
                    <div className="flex items-center ml-6">
                      <span className="text-xs text-gray-500 mr-2">Width:</span>
                      <input
                        type="number"
                        min="50"
                        max="500"
                        value={columnWidths[column.key] || column.width}
                        onChange={(e) =>
                          handleColumnResize(column.key, Number(e.target.value))
                        }
                        className="input w-20 py-1 text-sm"
                      />
                      <span className="ml-1 text-gray-500">px</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4">
              <h4 className="text-white font-medium mb-2">Column Order</h4>
              <div className="bg-gray-800 p-3 rounded-md">
                <div className="flex flex-wrap gap-2">
                  {columnOrder
                    .filter((columnKey) => visibleColumns.includes(columnKey))
                    .map((columnKey, index) => {
                      const column = columns.find(
                        (col) => col.key === columnKey,
                      );
                      if (!column) return null;
                      return (
                        <div
                          key={column.key}
                          className="bg-gray-700 text-gray-300 px-3 py-1 rounded-md text-sm flex items-center"
                          draggable={true}
                          onDragStart={() => setDraggingColumn(column.key)}
                          onDragEnd={() => setDraggingColumn(null)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (
                              draggingColumn &&
                              draggingColumn !== column.key
                            ) {
                              // Reorder columns
                              const newOrder = [...columnOrder];
                              const fromIndex =
                                newOrder.indexOf(draggingColumn);
                              const toIndex = newOrder.indexOf(column.key);
                              if (fromIndex !== -1 && toIndex !== -1) {
                                newOrder.splice(fromIndex, 1);
                                newOrder.splice(toIndex, 0, draggingColumn);
                                setColumnOrder(newOrder);
                                // Save to localStorage
                                localStorage.setItem(
                                  `excel-grid-order-${type}`,
                                  JSON.stringify(newOrder),
                                );
                              }
                            }
                            setDraggingColumn(null);
                          }}
                        >
                          {column.name}
                        </div>
                      );
                    })}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Drag and drop to reorder columns
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Data Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full min-w-[800px]">
          <thead className="bg-slate-900 text-gray-500 text-left">
            <tr>
              {/* Use columnOrder to determine the order of columns */}
              {columnOrder
                .filter((columnKey) => visibleColumns.includes(columnKey))
                .map((columnKey) => {
                  const column = columns.find((col) => col.key === columnKey);
                  if (!column) return null;
                  return (
                    <th
                      key={column.key}
                      className="p-0 text-sm text-center text-bold"
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggingColumn && draggingColumn !== column.key) {
                          // Highlight the drop target
                          e.currentTarget.classList.add("bg-gray-700");
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("bg-gray-700");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("bg-gray-700");
                        if (draggingColumn && draggingColumn !== column.key) {
                          // Reorder columns
                          const newOrder = [...columnOrder];
                          const fromIndex = newOrder.indexOf(draggingColumn);
                          const toIndex = newOrder.indexOf(column.key);
                          if (fromIndex !== -1 && toIndex !== -1) {
                            newOrder.splice(fromIndex, 1);
                            newOrder.splice(toIndex, 0, draggingColumn);
                            setColumnOrder(newOrder);
                            // Save to localStorage
                            localStorage.setItem(
                              `excel-grid-order-${type}`,
                              JSON.stringify(newOrder),
                            );
                          }
                        }
                        setDraggingColumn(null);
                      }}
                    >
                      <ResizableHeader
                        column={{
                          ...column,
                          width: columnWidths[column.key] || column.width,
                        }}
                        onResize={(width) =>
                          handleColumnResize(column.key, width)
                        }
                        onSort={() => handleSort(column.key)}
                        sortDirection={
                          sortColumn === column.key ? sortDirection : null
                        }
                        isFiltered={activeFilters.includes(column.key)}
                        onToggleFilter={() => {
                          if (activeFilters.includes(column.key)) {
                            handleFilterChange(column.key, null);
                          } else {
                            setShowFilterPanel(true);
                            // Focus the filter input for this column
                            setTimeout(() => {
                              const input = document.querySelector(
                                `[data-filter-key="${column.key}"]`,
                              );
                              if (input) (input as HTMLInputElement).focus();
                            }, 100);
                          }
                        }}
                        onDragStart={() => setDraggingColumn(column.key)}
                        onDragEnd={() => setDraggingColumn(null)}
                        className="flex"
                      />
                    </th>
                  );
                })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-700/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columnOrder
                    .filter((columnKey) => visibleColumns.includes(columnKey))
                    .map((columnKey) => {
                      const column = columns.find(
                        (col) => col.key === columnKey,
                      );
                      if (!column) return null;
                      return (
                        <td
                          key={`${rowIndex}-${column.key}`}
                          className="px-4 py-2 text-sm text-gray-300 text-left"
                          style={{
                            minWidth: `${columnWidths[column.key] || column.width}px`,
                            maxWidth: `${(columnWidths[column.key] || column.width) * 1.5}px`,
                          }}
                        >
                          {renderCell(column, row)}
                        </td>
                      );
                    })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columnOrder.filter((columnKey) =>
                      visibleColumns.includes(columnKey),
                    ).length
                  }
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredData.length}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
        itemsPerPageOptions={[10, 25, 50, 100]}
      />
      {/* Data Summary */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {paginatedData.length} of {filteredData.length} items
        {activeFilters.length > 0 &&
          ` (filtered from ${data.length} total items)`}
      </div>
    </div>
  );
}
