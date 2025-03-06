import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  AlertTriangle,
  Edit2,
  Save,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInventoryStore } from "@/stores/inventoryStore";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface InventoryItem {
  id: string;
  product: string;
  category: string;
  storage_area: string;
  unit_type: string;
  previous_count: number;
  current_count: number;
  expected_count: number;
  variance: number;
  variance_percent: number;
  cost_per_unit: number;
  total_value: number;
  counted_by: string;
  counted_at: string;
  status: "pending" | "approved" | "flagged" | "adjusted";
}

interface InventoryReviewProps {
  inventoryDate?: string;
  onApprove: () => void;
  onReject: () => void;
}

export const InventoryReview: React.FC<InventoryReviewProps> = ({
  inventoryDate = new Date().toISOString().split("T")[0],
  onApprove,
  onReject,
}) => {
  const { fetchItems } = useInventoryStore();
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [filterOptions, setFilterOptions] = useState({
    showOnlyVariance: false,
    categoryFilter: "all",
    locationFilter: "all",
    statusFilter: "all",
  });
  const [stats, setStats] = useState({
    totalItems: 0,
    itemsWithVariance: 0,
    totalValue: 0,
    varianceValue: 0,
    variancePercent: 0,
    approvedItems: 0,
    flaggedItems: 0,
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData: InventoryItem[] = [
        {
          id: "1",
          product: "Chicken Breast",
          category: "Proteins",
          storage_area: "Walk-in Cooler",
          unit_type: "lb",
          previous_count: 25,
          current_count: 22,
          expected_count: 28,
          variance: -6,
          variance_percent: -21.4,
          cost_per_unit: 3.99,
          total_value: 87.78,
          counted_by: "John Doe",
          counted_at: "2023-06-15T08:30:00Z",
          status: "pending",
        },
        {
          id: "2",
          product: "Romaine Lettuce",
          category: "Produce",
          storage_area: "Walk-in Cooler",
          unit_type: "case",
          previous_count: 5,
          current_count: 4,
          expected_count: 4,
          variance: 0,
          variance_percent: 0,
          cost_per_unit: 24.99,
          total_value: 99.96,
          counted_by: "Jane Smith",
          counted_at: "2023-06-15T09:15:00Z",
          status: "approved",
        },
        {
          id: "3",
          product: "Olive Oil",
          category: "Dry Goods",
          storage_area: "Dry Storage",
          unit_type: "bottle",
          previous_count: 12,
          current_count: 8,
          expected_count: 10,
          variance: -2,
          variance_percent: -20,
          cost_per_unit: 18.5,
          total_value: 148.0,
          counted_by: "Mike Johnson",
          counted_at: "2023-06-15T10:00:00Z",
          status: "flagged",
        },
        {
          id: "4",
          product: "Ground Beef",
          category: "Proteins",
          storage_area: "Walk-in Freezer",
          unit_type: "lb",
          previous_count: 30,
          current_count: 35,
          expected_count: 32,
          variance: 3,
          variance_percent: 9.4,
          cost_per_unit: 4.5,
          total_value: 157.5,
          counted_by: "John Doe",
          counted_at: "2023-06-15T08:45:00Z",
          status: "pending",
        },
        {
          id: "5",
          product: "Tomatoes",
          category: "Produce",
          storage_area: "Walk-in Cooler",
          unit_type: "case",
          previous_count: 3,
          current_count: 2,
          expected_count: 3,
          variance: -1,
          variance_percent: -33.3,
          cost_per_unit: 32.99,
          total_value: 65.98,
          counted_by: "Jane Smith",
          counted_at: "2023-06-15T09:30:00Z",
          status: "adjusted",
        },
      ];

      setItems(mockData);
      setFilteredItems(mockData);

      // Calculate stats
      const totalValue = mockData.reduce(
        (sum, item) => sum + item.total_value,
        0,
      );
      const itemsWithVariance = mockData.filter(
        (item) => item.variance !== 0,
      ).length;
      const varianceValue = mockData.reduce((sum, item) => {
        return sum + item.variance * item.cost_per_unit;
      }, 0);
      const variancePercent =
        totalValue > 0 ? (varianceValue / totalValue) * 100 : 0;
      const approvedItems = mockData.filter(
        (item) => item.status === "approved",
      ).length;
      const flaggedItems = mockData.filter(
        (item) => item.status === "flagged",
      ).length;

      setStats({
        totalItems: mockData.length,
        itemsWithVariance,
        totalValue,
        varianceValue,
        variancePercent,
        approvedItems,
        flaggedItems,
      });

      setLoading(false);
    }, 1000);
  }, []);

  // Apply filters
  useEffect(() => {
    if (items.length === 0) return;

    let filtered = [...items];

    if (filterOptions.showOnlyVariance) {
      filtered = filtered.filter((item) => item.variance !== 0);
    }

    if (filterOptions.categoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.category === filterOptions.categoryFilter,
      );
    }

    if (filterOptions.locationFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.storage_area === filterOptions.locationFilter,
      );
    }

    if (filterOptions.statusFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.status === filterOptions.statusFilter,
      );
    }

    setFilteredItems(filtered);
  }, [items, filterOptions]);

  const handleUpdateCount = (id: string) => {
    if (!editingItem) return;

    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const newCount = editValue;
        const variance = newCount - item.expected_count;
        const variancePercent =
          item.expected_count > 0 ? (variance / item.expected_count) * 100 : 0;
        const totalValue = newCount * item.cost_per_unit;

        return {
          ...item,
          current_count: newCount,
          variance,
          variance_percent: variancePercent,
          total_value: totalValue,
          status: "adjusted",
        };
      }
      return item;
    });

    setItems(updatedItems);
    setEditingItem(null);

    // Recalculate stats
    const totalValue = updatedItems.reduce(
      (sum, item) => sum + item.total_value,
      0,
    );
    const itemsWithVariance = updatedItems.filter(
      (item) => item.variance !== 0,
    ).length;
    const varianceValue = updatedItems.reduce((sum, item) => {
      return sum + item.variance * item.cost_per_unit;
    }, 0);
    const variancePercent =
      totalValue > 0 ? (varianceValue / totalValue) * 100 : 0;
    const approvedItems = updatedItems.filter(
      (item) => item.status === "approved",
    ).length;
    const flaggedItems = updatedItems.filter(
      (item) => item.status === "flagged",
    ).length;

    setStats({
      totalItems: updatedItems.length,
      itemsWithVariance,
      totalValue,
      varianceValue,
      variancePercent,
      approvedItems,
      flaggedItems,
    });
  };

  const handleApproveItem = async (id: string) => {
    try {
      // Try to update in the database first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (organizationId) {
        const { error } = await supabase
          .from("inventory_counts")
          .update({ status: "completed" })
          .eq("id", id)
          .eq("organization_id", organizationId);

        if (error) {
          console.warn("Error updating inventory count status:", error);
        } else {
          // Refresh data from the server
          await fetchItems();
          toast.success("Item approved successfully");
          return;
        }
      }
    } catch (error) {
      console.warn("Error updating inventory count:", error);
    }

    // Fallback to local state update
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, status: "approved" };
      }
      return item;
    });

    setItems(updatedItems);
  };

  const handleFlagItem = async (id: string) => {
    try {
      // Try to update in the database first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organizationId;

      if (organizationId) {
        const { error } = await supabase
          .from("inventory_counts")
          .update({ status: "flagged" })
          .eq("id", id)
          .eq("organization_id", organizationId);

        if (error) {
          console.warn("Error updating inventory count status:", error);
        } else {
          // Refresh data from the server
          await fetchItems();
          toast.success("Item flagged for review");
          return;
        }
      }
    } catch (error) {
      console.warn("Error updating inventory count:", error);
    }

    // Fallback to local state update
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, status: "flagged" };
      }
      return item;
    });

    setItems(updatedItems);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            Approved
          </span>
        );
      case "flagged":
        return (
          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            Flagged
          </span>
        );
      case "adjusted":
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
            Adjusted
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
            Pending
          </span>
        );
    }
  };

  const getVarianceIndicator = (variance: number) => {
    if (variance === 0) return null;

    if (variance > 0) {
      return (
        <span className="flex items-center text-green-400">
          <ArrowUpRight className="w-4 h-4 mr-1" />
          {variance}
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-red-400">
          <ArrowDownRight className="w-4 h-4 mr-1" />
          {variance}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-400">Loading inventory data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Inventory Review</h2>
          <p className="text-gray-400">
            Review and approve inventory count from {inventoryDate}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="btn-ghost">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            className="btn-primary bg-green-500 hover:bg-green-600"
            onClick={onApprove}
          >
            <Check className="w-4 h-4 mr-2" />
            Approve All
          </button>
          <button
            className="btn-ghost text-red-400 hover:text-red-300"
            onClick={onReject}
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-white">
            {stats.totalItems}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.itemsWithVariance} items with variance
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">
            ${stats.totalValue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.approvedItems} items approved
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Variance Value</div>
          <div
            className={`text-2xl font-bold ${stats.varianceValue < 0 ? "text-red-400" : "text-green-400"}`}
          >
            ${Math.abs(stats.varianceValue).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.variancePercent.toFixed(2)}% of total value
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Status</div>
          <div className="text-2xl font-bold text-white">
            {stats.flaggedItems > 0 ? "Needs Review" : "Ready for Approval"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.flaggedItems} items flagged for review
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-400">Filters:</span>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showVariance"
            checked={filterOptions.showOnlyVariance}
            onChange={(e) =>
              setFilterOptions({
                ...filterOptions,
                showOnlyVariance: e.target.checked,
              })
            }
            className="mr-2"
          />
          <label htmlFor="showVariance" className="text-sm text-gray-300">
            Show Only Variance
          </label>
        </div>

        <select
          className="input text-sm py-1"
          value={filterOptions.categoryFilter}
          onChange={(e) =>
            setFilterOptions({
              ...filterOptions,
              categoryFilter: e.target.value,
            })
          }
        >
          <option value="all">All Categories</option>
          <option value="Proteins">Proteins</option>
          <option value="Produce">Produce</option>
          <option value="Dry Goods">Dry Goods</option>
        </select>

        <select
          className="input text-sm py-1"
          value={filterOptions.locationFilter}
          onChange={(e) =>
            setFilterOptions({
              ...filterOptions,
              locationFilter: e.target.value,
            })
          }
        >
          <option value="all">All Locations</option>
          <option value="Walk-in Cooler">Walk-in Cooler</option>
          <option value="Walk-in Freezer">Walk-in Freezer</option>
          <option value="Dry Storage">Dry Storage</option>
        </select>

        <select
          className="input text-sm py-1"
          value={filterOptions.statusFilter}
          onChange={(e) =>
            setFilterOptions({ ...filterOptions, statusFilter: e.target.value })
          }
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
          <option value="adjusted">Adjusted</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                Location
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                Expected
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                Counted
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                Variance
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                Value
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-700/30">
                <td className="px-4 py-3 text-sm text-white">{item.product}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.category}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.storage_area}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-300">
                  {item.expected_count} {item.unit_type}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {editingItem === item.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <input
                        type="number"
                        className="input w-20 text-right py-1"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                      <button
                        onClick={() => handleUpdateCount(item.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-white">
                      {item.current_count} {item.unit_type}
                      <button
                        onClick={() => {
                          setEditingItem(item.id);
                          setEditValue(item.current_count);
                        }}
                        className="ml-2 text-gray-400 hover:text-primary-400"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {getVarianceIndicator(item.variance)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-white">
                  ${item.total_value.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleApproveItem(item.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                      disabled={item.status === "approved"}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFlagItem(item.id)}
                      className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      disabled={item.status === "flagged"}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary and Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-3">
            Inventory Notes
          </h3>
          <textarea
            className="input w-full h-32"
            placeholder="Add notes about this inventory count..."
          ></textarea>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-white mb-3">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Items:</span>
              <span className="text-white">{stats.totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Items with Variance:</span>
              <span className="text-white">{stats.itemsWithVariance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Value:</span>
              <span className="text-white">${stats.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Variance Value:</span>
              <span
                className={
                  stats.varianceValue < 0 ? "text-red-400" : "text-green-400"
                }
              >
                ${Math.abs(stats.varianceValue).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Variance Percentage:</span>
              <span
                className={
                  stats.variancePercent < 0 ? "text-red-400" : "text-green-400"
                }
              >
                {Math.abs(stats.variancePercent).toFixed(2)}%
              </span>
            </div>
            <div className="border-t border-gray-700 my-2 pt-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Counted By:</span>
                <span className="text-white">Multiple Users</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Count Date:</span>
                <span className="text-white">{inventoryDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
