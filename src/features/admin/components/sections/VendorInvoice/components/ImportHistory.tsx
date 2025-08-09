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
  ChevronDown,
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

type DateRangeOption =
  | "all"
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "custom";

export const ImportHistory: React.FC = () => {
  const { user, isLoading: authLoading, organizationId } = useAuth();
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRangeOption, setDateRangeOption] =
    useState<DateRangeOption>("all");
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Update date range based on selected option
  useEffect(() => {
    const today = new Date();
    const end = new Date(today);
    let start = new Date(today);

    switch (dateRangeOption) {
      case "today":
        // Start and end are both today
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "last7days":
        start.setDate(today.getDate() - 6); // Last 7 days including today
        break;
      case "last30days":
        start.setDate(today.getDate() - 29); // Last 30 days including today
        break;
      case "custom":
        // Don't change the dates, just show the date picker
        setShowDatePicker(true);
        return;
      case "all":
        // Don't set any date range for "all"
        setShowDatePicker(false);
        return;
    }

    if (dateRangeOption !== "all" && dateRangeOption !== "custom") {
      setDateRange({
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      });
      setShowDatePicker(false);
    }
  }, [dateRangeOption]);

  // Fetch import history
  const fetchImportHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait for auth to be loaded and check for organization ID
      if (authLoading) {
        console.log("[ImportHistory] Auth still loading, skipping fetch");
        setIsLoading(false);
        return;
      }

      // Get the organization ID from useAuth hook or user metadata
      const orgId = organizationId || user?.user_metadata?.organizationId;
      if (!orgId) {
        console.log("[ImportHistory] No organization ID found:", {
          organizationId,
          userMetadata: user?.user_metadata,
          userId: user?.id,
        });
        setError(
          "Organization ID not found. Please ensure you have access to an organization.",
        );
        setIsLoading(false);
        return;
      }

      console.log("[ImportHistory] Using organization ID:", orgId);

      // Query the vendor_imports table
      let query = supabase
        .from("vendor_imports")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      // Apply date range filter if not showing all
      if (dateRangeOption !== "all") {
        // Format dates for query
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        // Ensure we include the entire end day by setting to 23:59:59
        endDate.setHours(23, 59, 59, 999);

        query = query
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        console.log("Date range used:", {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        });
      } else {
        // If showing all, limit to the last 25 records
        query = query.limit(25);
        console.log("Fetching last 25 records without date filter");
      }

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(
          `vendor_id.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%,import_type.ilike.%${searchTerm}%`,
        );
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Always use real data from the database
      console.log("Fetched import records:", data);
      setImports(data as ImportRecord[]);

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching import history:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load import history",
      );
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    // Only fetch if auth is not loading and we have user data
    if (!authLoading && user) {
      console.log("Fetching import history with date option:", dateRangeOption);
      fetchImportHistory();
    } else if (!authLoading && !user) {
      console.log("No user found, cannot fetch import history");
      setError("User not authenticated");
      setIsLoading(false);
    }
  }, [dateRange, dateRangeOption, authLoading, user, organizationId]);

  // Add a manual refresh button click handler
  const handleRefresh = () => {
    console.log("Manual refresh requested");
    fetchImportHistory();
  };

  // No automatic refresh interval - only fetch when explicitly requested

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
    <div className="space-y-6 ImportHistory">
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
        <button onClick={handleRefresh} className="btn-ghost mr-2">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Date Range
          </label>
          <div className="relative">
            <select
              value={dateRangeOption}
              onChange={(e) =>
                setDateRangeOption(e.target.value as DateRangeOption)
              }
              className="input w-full appearance-none pr-10"
            >
              <option value="all">All Records (Last 25)</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-end">
          <button onClick={fetchImportHistory} className="btn-ghost-green h-10">
            <Search className="w-4 h-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker - Only shown when custom is selected */}
      {showDatePicker && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border border-gray-700 rounded-lg bg-gray-800/50">
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
      )}

      {/* Import History Table using ExcelDataGrid */}
      {authLoading || isLoading ? (
        <div className="flex items-center justify-center p-8 text-gray-400">
          <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
          {authLoading
            ? "Loading authentication..."
            : "Loading import history..."}
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
