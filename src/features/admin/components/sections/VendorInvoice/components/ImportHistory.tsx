import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Camera,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface ImportRecord {
  id: string;
  created_at: string;
  vendor_id: string;
  import_type: string;
  file_name: string;
  items_count: number;
  price_changes: number;
  new_items: number;
  status: string;
  created_by: string;
  created_by_name?: string;
}

export const ImportHistory: React.FC = () => {
  const { user } = useAuth();
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(
    () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1); // Default to last month
      return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      };
    },
  );

  // Fetch import history
  const fetchImportHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the organization ID from user metadata
      const organizationId = user?.user_metadata?.organizationId;
      if (!organizationId) {
        throw new Error("Organization ID not found");
      }

      // Format dates for query
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59); // Include the entire end day

      // Query the vendor_imports table
      let query = supabase
        .from("vendor_imports")
        .select("*")
        .eq("organization_id", organizationId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: false });

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(
          `vendor_id.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%,import_type.ilike.%${searchTerm}%`,
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // If no real data yet, use mock data for demonstration
      if (!data || data.length === 0) {
        const mockImports: ImportRecord[] = [
          {
            id: "1",
            created_at: new Date().toISOString(),
            vendor_id: "Sysco",
            import_type: "csv",
            file_name: "sysco_invoice_june_2024.csv",
            items_count: 42,
            price_changes: 8,
            new_items: 3,
            status: "completed",
            created_by: user?.id || "",
            created_by_name: user?.user_metadata?.name || "Admin User",
          },
          {
            id: "2",
            created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            vendor_id: "US Foods",
            import_type: "pdf",
            file_name: "usfoods_invoice_123456.pdf",
            items_count: 28,
            price_changes: 5,
            new_items: 0,
            status: "completed",
            created_by: user?.id || "",
            created_by_name: user?.user_metadata?.name || "Admin User",
          },
          {
            id: "3",
            created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            vendor_id: "Gordon Food Service",
            import_type: "csv",
            file_name: "gfs_weekly_order.csv",
            items_count: 35,
            price_changes: 12,
            new_items: 2,
            status: "completed",
            created_by: user?.id || "",
            created_by_name: user?.user_metadata?.name || "Admin User",
          },
          {
            id: "4",
            created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            vendor_id: "Sysco",
            import_type: "photo",
            file_name: "invoice_photo_123.jpg",
            items_count: 15,
            price_changes: 3,
            new_items: 1,
            status: "completed",
            created_by: user?.id || "",
            created_by_name: user?.user_metadata?.name || "Admin User",
          },
          {
            id: "5",
            created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
            vendor_id: "US Foods",
            import_type: "csv",
            file_name: "usfoods_monthly_order.csv",
            items_count: 52,
            price_changes: 15,
            new_items: 4,
            status: "completed",
            created_by: user?.id || "",
            created_by_name: user?.user_metadata?.name || "Admin User",
          },
        ];

        // Filter mock data by date range
        const filteredMockImports = mockImports.filter((importRecord) => {
          const importDate = new Date(importRecord.created_at);
          return importDate >= startDate && importDate <= endDate;
        });

        // Filter by search term
        const searchFilteredMocks = filteredMockImports.filter(
          (importRecord) =>
            !searchTerm ||
            importRecord.vendor_id
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            importRecord.file_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            importRecord.import_type
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        );

        setImports(searchFilteredMocks);
        setTotalPages(Math.ceil(searchFilteredMocks.length / itemsPerPage));
      } else {
        // Use real data from the database
        setImports(data as ImportRecord[]);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching import history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load import history",
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImportHistory();
  }, [searchTerm, dateRange]);

  // Get paginated data
  const paginatedImports = imports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Get icon for import type
  const getImportTypeIcon = (type: string) => {
    switch (type) {
      case "csv":
        return <FileSpreadsheet className="w-4 h-4" />;
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "photo":
        return <Camera className="w-4 h-4" />;
      default:
        return <FileSpreadsheet className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Import History</h2>
        <button onClick={fetchImportHistory} className="btn-ghost">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vendor, file name, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="input w-full"
          />
        </div>
      </div>

      {/* Import History Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                File
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                Items
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                Price Changes
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                New Items
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
                    Loading import history...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center text-rose-400 gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                  </div>
                </td>
              </tr>
            ) : paginatedImports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No import history found for the selected filters.
                </td>
              </tr>
            ) : (
              paginatedImports.map((importRecord) => (
                <tr key={importRecord.id} className="hover:bg-gray-700/30">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatDate(importRecord.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {importRecord.vendor_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      {getImportTypeIcon(importRecord.import_type)}
                      <span>{importRecord.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-300">
                    {importRecord.items_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${importRecord.price_changes > 0 ? "bg-amber-500/20 text-amber-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {importRecord.price_changes}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${importRecord.new_items > 0 ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}
                    >
                      {importRecord.new_items}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        importRecord.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : importRecord.status === "failed"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {importRecord.status.charAt(0).toUpperCase() +
                        importRecord.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          // View details
                          toast.info(
                            `Viewing details for ${importRecord.file_name}`,
                          );
                        }}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Download original file
                          toast.info(`Downloading ${importRecord.file_name}`);
                        }}
                        className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        title="Download original file"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          // Delete import record
                          if (
                            window.confirm(
                              "Are you sure you want to delete this import record? This won't affect any data that was imported.",
                            )
                          ) {
                            toast.success(
                              `Deleted import record for ${importRecord.file_name}`,
                            );
                            // In a real implementation, this would delete the record from the database
                            setImports((prev) =>
                              prev.filter((i) => i.id !== importRecord.id),
                            );
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {imports.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {paginatedImports.length} of {imports.length} imports
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
