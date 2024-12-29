import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Search, ImageIcon, Edit, Trash2 } from 'lucide-react';
import type { ExcelColumn } from '@/types';

interface ExcelDataGridProps {
  columns: ExcelColumn[];
  data: any[];
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  type: 'inventory' | 'prepared-items' | 'master-ingredients';
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export const ExcelDataGrid: React.FC<ExcelDataGridProps> = ({
  columns,
  data,
  categoryFilter,
  onCategoryChange,
  type,
  onRowClick,
  onEdit,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Update scroll dimensions when content changes
  useEffect(() => {
    if (tableRef.current) {
      const { scrollWidth, clientWidth } = tableRef.current;
      setMaxScroll(scrollWidth - clientWidth);
    }
  }, [data, columns]);

  // Handle scroll events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollLeft } = e.currentTarget;
    setScrollPosition(scrollLeft);
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(data.map(item => 
      item.category || item.categoryName || 'Uncategorized'
    ))).sort();
    return ['all', ...uniqueCategories];
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemCategory = item.category || item.categoryName;
        return itemCategory === categoryFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        // Search in all fields
        return Object.entries(item).some(([key, value]) => {
          // Skip searching in complex objects or arrays
          if (typeof value === 'object' || Array.isArray(value)) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested object paths
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        }

        // Handle null/undefined values
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (aValue === bValue) return 0;

        // Convert to strings for comparison if not numbers
        if (typeof aValue !== 'number' || typeof bValue !== 'number') {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, categoryFilter, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const formatCellValue = (value: any, type: string, row?: any) => {
    if (value == null || value === '') return '';

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(parseFloat(value) || 0);
      case 'percent':
        return `${value}%`;
      case 'boolean':
        return value ? '✓' : '';
      case 'imageUrl':
        return value ? (
          <img 
            src={value} 
            alt="Product" 
            className="w-8 h-8 rounded object-cover mx-auto"
          />
        ) : (
          <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mx-auto">
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </div>
        );
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
                className="p-1 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row);
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      default:
        return String(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="input sm:w-48 text-sm"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table Container */}
      <div className="relative rounded-lg border border-gray-700 bg-gray-800/50">
        {/* Scroll Progress Bar */}
        <div className="sticky top-0 z-20 w-full h-1 bg-gray-700">
          <div 
            className="h-full bg-primary-500/50 transition-all"
            style={{ 
              width: maxScroll > 0 ? '100%' : '0%',
              transform: `translateX(${(scrollPosition / maxScroll) * 100}%)`,
              display: maxScroll > 0 ? 'block' : 'none'
            }}
          />
        </div>

        {/* Table with Horizontal Scroll */}
        <div 
          ref={tableRef}
          className="overflow-x-auto"
          onScroll={handleScroll}
        >
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.key !== 'actions' && handleSort(column.key)}
                    className={`sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm
                      px-3 py-3.5 text-center text-sm font-semibold text-gray-300
                      cursor-pointer hover:text-white transition-colors
                      ${column.width ? `w-[${column.width}px]` : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {column.name}
                      {sortConfig?.key === column.key && (
                        <span className="text-primary-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-transparent">
              {filteredAndSortedData.map((item, index) => (
                <tr 
                  key={item.id || index}
                  className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => {
                    let value = item[column.key];
                    
                    // Handle nested object paths
                    if (column.key.includes('.')) {
                      value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
                    }
                    
                    return (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-3 py-3 text-sm text-gray-300 text-center"
                      >
                        {formatCellValue(value, column.type, item)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400 text-right">
        Showing {filteredAndSortedData.length} of {data.length} items
      </div>
    </div>
  );
};