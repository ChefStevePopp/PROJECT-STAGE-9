import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  LineChart,
  History,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useVendorPriceChangesStore } from "@/stores/vendorPriceChangesStore";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { ExcelDataGrid } from "@/shared/components/ExcelDataGrid";
import { priceHistoryColumns } from "./PriceHistory/columns";
import { PriceChangeCell } from "./PriceHistory/PriceChangeCell";

export const PriceHistory = () => {
  const [daysToShow, setDaysToShow] = useState(45);
  const {
    priceChanges,
    isLoading: priceChangesLoading,
    error: priceChangesError,
    fetchPriceChanges,
    setFilter,
  } = useVendorPriceChangesStore();
  const {
    priceTrends,
    isLoading: trendsLoading,
    error: trendsError,
    fetchPriceTrends,
  } = useVendorCodesStore();

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(
    () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3); // Default to last 3 months
      return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      };
    },
  );

  const isLoading = priceChangesLoading || trendsLoading;
  const error = priceChangesError || trendsError;

  const [activeFilter, setActiveFilter] = useState<{
    filterType?: "increase" | "decrease";
    ingredientId?: string;
  }>({});

  useEffect(() => {
    fetchPriceChanges(daysToShow, activeFilter);
    fetchPriceTrends();
  }, [fetchPriceChanges, fetchPriceTrends, daysToShow, activeFilter]);

  // Calculate price statistics from the table data (priceChanges)
  const priceStats = React.useMemo(() => {
    const stats = {
      avgIncrease: 0,
      avgDecrease: 0,
      maxIncrease: 0,
      maxDecrease: 0,
      totalChanges: 0,
      maxIncreaseItem: null,
      maxDecreaseItem: null,
    };

    // Use the same data as the table (priceChanges)
    const dataToUse = priceChanges;

    // Filter out items with no change
    const validTrends = dataToUse.filter((t) => t.change_percent !== 0);
    const increases = validTrends.filter((t) => t.change_percent > 0);
    const decreases = validTrends.filter((t) => t.change_percent < 0);

    // Calculate average increase
    stats.avgIncrease =
      increases.length > 0
        ? increases.reduce((sum, t) => sum + t.change_percent, 0) /
          increases.length
        : 0;

    // Calculate average decrease (as a positive number)
    stats.avgDecrease =
      decreases.length > 0
        ? Math.abs(
            decreases.reduce((sum, t) => sum + t.change_percent, 0) /
              decreases.length,
          )
        : 0;

    // Find the item with maximum increase
    if (increases.length > 0) {
      const maxIncreaseValue = Math.max(
        ...increases.map((t) => t.change_percent),
      );
      stats.maxIncrease = maxIncreaseValue;
      stats.maxIncreaseItem =
        increases.find((t) => t.change_percent === maxIncreaseValue) || null;
    }

    // Find the item with maximum decrease (as a positive number)
    if (decreases.length > 0) {
      const maxDecreaseValue = Math.abs(
        Math.min(...decreases.map((t) => t.change_percent)),
      );
      stats.maxDecrease = maxDecreaseValue;
      const minChangeValue = Math.min(
        ...decreases.map((t) => t.change_percent),
      );
      stats.maxDecreaseItem =
        decreases.find((t) => t.change_percent === minChangeValue) || null;
    }

    // Total number of price changes
    stats.totalChanges = validTrends.length;

    return stats;
  }, [priceChanges]);

  // Filter price changes based on active filter
  const filteredPriceChanges = React.useMemo(() => {
    // First filter out items with no change
    let filtered = priceChanges.filter((change) => change.change_percent !== 0);

    // Apply active filters
    if (activeFilter.filterType === "increase") {
      filtered = filtered.filter((change) => change.change_percent > 0);
      // Sort by change_percent in descending order for increases
      filtered = [...filtered].sort(
        (a, b) => b.change_percent - a.change_percent,
      );
    } else if (activeFilter.filterType === "decrease") {
      filtered = filtered.filter((change) => change.change_percent < 0);
      // Sort by absolute change_percent in descending order for decreases
      filtered = [...filtered].sort(
        (a, b) => Math.abs(b.change_percent) - Math.abs(a.change_percent),
      );
    } else if (activeFilter.ingredientId) {
      filtered = filtered.filter(
        (change) => change.ingredient_id === activeFilter.ingredientId,
      );
      // Sort by date for ingredient-specific view
      filtered = [...filtered].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return filtered;
  }, [priceChanges, activeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading price history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-rose-500/10 text-rose-400 p-4 rounded-lg">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error Loading Price History</p>
          <p className="text-sm text-gray-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 bg-[#262d3c] p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#262d3c]">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <LineChart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Price History Dashboard
            </h3>
            <p className="text-sm text-gray-400">
              Track and analyze vendor price changes
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setActiveFilter({});
            fetchPriceChanges(daysToShow);
            fetchPriceTrends();
          }}
          className="btn-ghost mr-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
      {/* Price Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div
          className="card p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          onClick={() => (window.location.hash = "#price-changes")}
          title="View all price changes"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Total Price Changes
              </h3>
              <p className="text-2xl font-bold text-white">
                {priceStats.totalChanges}
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                Click to view all
              </span>
            </div>
          </div>
        </div>

        <div
          className="card p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          onClick={() => {
            if (priceStats.avgDecrease > 0) {
              const newFilter = { filterType: "decrease" as const };
              setActiveFilter(newFilter);
              fetchPriceChanges(daysToShow, newFilter);
            }
          }}
          title="View price decreases"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Avg. Price Decrease
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {priceStats.avgDecrease > 0
                  ? priceStats.avgDecrease.toFixed(1)
                  : "0.0"}
                %
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                Click to filter
              </span>
            </div>
          </div>
        </div>

        <div
          className="card p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          onClick={() => {
            if (priceStats.avgIncrease > 0) {
              const newFilter = { filterType: "increase" as const };
              setActiveFilter(newFilter);
              fetchPriceChanges(daysToShow, newFilter);
            }
          }}
          title="View price increases"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Avg. Price Increase
              </h3>
              <p className="text-2xl font-bold text-rose-400">
                {priceStats.avgIncrease > 0
                  ? priceStats.avgIncrease.toFixed(1)
                  : "0.0"}
                %
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                Click to filter
              </span>
            </div>
          </div>
        </div>

        <div
          className="card p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          onClick={() => {
            // Show all price increases, sorted by highest first
            const newFilter = { filterType: "increase" as const };
            setActiveFilter(newFilter);
            fetchPriceChanges(daysToShow, newFilter);
          }}
          title="View max price increase details"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Max Price Increase
              </h3>
              <p className="text-2xl font-bold text-amber-400">
                {priceStats.maxIncrease > 0
                  ? priceStats.maxIncrease.toFixed(1)
                  : "0.0"}
                %
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                Click to view all increases
              </span>
            </div>
          </div>
        </div>

        <div
          className="card p-4 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer"
          onClick={() => {
            // Show all price decreases, sorted by highest absolute decrease first
            const newFilter = { filterType: "decrease" as const };
            setActiveFilter(newFilter);
            fetchPriceChanges(daysToShow, newFilter);
          }}
          title="View max price decrease details"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Max Price Decrease
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {priceStats.maxDecrease > 0
                  ? priceStats.maxDecrease.toFixed(1)
                  : "0.0"}
                %
              </p>
              <span className="text-xs text-gray-400 mt-1 block">
                Click to view all decreases
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Price Changes */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h4 className="text-lg font-medium text-white">
              Recent Price Changes
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show last</span>
              <select
                value={daysToShow}
                onChange={(e) => {
                  const newDays = Number(e.target.value);
                  setDaysToShow(newDays);
                  fetchPriceChanges(newDays, activeFilter);
                }}
                className="input input-sm bg-gray-900/50"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => (window.location.hash = "#analytics")}
            className="btn-ghost btn-sm"
          >
            <History className="w-4 h-4 mr-2" />
            View All History
          </button>
        </div>

        {/* Excel Data Grid */}
        <div id="price-changes">
          {Object.keys(activeFilter).length > 0 && (
            <div className="mb-4 p-2 bg-blue-500/10 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm text-blue-400">
                  {activeFilter.filterType === "increase" &&
                    "Showing price increases only"}
                  {activeFilter.filterType === "decrease" &&
                    "Showing price decreases only"}
                  {activeFilter.ingredientId &&
                    "Showing specific ingredient details"}
                </div>
              </div>
              <button
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                onClick={() => {
                  setActiveFilter({});
                  fetchPriceChanges(daysToShow);
                }}
              >
                <RefreshCw className="w-3 h-3" /> Clear filter
              </button>
            </div>
          )}
          <ExcelDataGrid
            columns={priceHistoryColumns}
            data={filteredPriceChanges}
            onRefresh={() => fetchPriceChanges(daysToShow, activeFilter)}
          />
        </div>
      </div>
    </div>
  );
};
