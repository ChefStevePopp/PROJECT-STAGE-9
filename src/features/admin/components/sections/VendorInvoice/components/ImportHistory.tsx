import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileSpreadsheet,
  FileText,
  Camera,
  RefreshCw,
  Search,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  History,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { ExcelDataGrid } from "@/shared/components/ExcelDataGrid";
import type { ExcelColumn } from "@/types/excel";

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

        setImports(filteredMockImports);
      } else {
        // Use real data from the database
        setImports(data as ImportRecord[]);
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
  }, [dateRange]);

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

  // Define columns for ExcelDataGrid
  const columns: ExcelColumn[] = [
    {
      key: "created_at",
      name: "Date",
      type: "date",
      width: 180,
      sortable: true,
      filterable: true,
    },
    {
      key: "vendor_id",
      name: "Vendor",
      type: "text",
      width: 150,
      sortable: true,
      filterable: true,
    },
    {
      key: "file_name",
      name: "File",
      type: "text",
      width: 200,
      sortable: true,
      filterable: true,
    },
    {
      key: "items_count",
      name: "Items",
      type: "number",
      width: 100,
      sortable: true,
      filterable: true,
    },
    {
      key: "price_changes",
      name: "Price Changes",
      type: "number",
      width: 120,
      sortable: true,
      filterable: true,
    },
    {
      key: "new_items",
      name: "New Items",
      type: "number",
      width: 120,
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      name: "Status",
      type: "text",
      width: 120,
      sortable: true,
      filterable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 bg-[#262d3c] p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#262d3c]">
          <div className="w-10 h-10 rounded-lg bg-lime-500/20 flex items-center justify-center">
            <History className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">Import History</h3>
            <p className="text-sm text-gray-400">
              View and manage your invoice import history across all vendors
            </p>
          </div>
        </div>
        <button onClick={fetchImportHistory} className="btn-ghost mr-2">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Import History Table using ExcelDataGrid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8 text-gray-400">
          <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
          Loading import history...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-8 text-rose-400 gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <ExcelDataGrid
          columns={columns}
          data={imports.map((importRecord) => ({
            ...importRecord,
            // Add custom actions to each row
            actions: (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    // View details
                    toast.info(`Viewing details for ${importRecord.file_name}`);
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
            ),
          }))}
          onRefresh={fetchImportHistory}
          type="import-history"
        />
      )}
    </div>
  );
};
