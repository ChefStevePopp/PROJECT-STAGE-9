import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  History,
  AlertTriangle,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import { useVendorPriceChangesStore } from "@/stores/vendorPriceChangesStore";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { QuickStatCard } from "./QuickStatCard";

interface PriceChange {
  id: string;
  vendor: string;
  item_code: string;
  product_name: string;
  old_price: number;
  new_price: number;
  change_percent: number;
  date: string;
}

export const PriceHistory = () => {
  const [daysToShow, setDaysToShow] = useState(45);
  const {
    priceChanges,
    isLoading: priceChangesLoading,
    error: priceChangesError,
    fetchPriceChanges,
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

  useEffect(() => {
    fetchPriceChanges(daysToShow);
    fetchPriceTrends();
  }, [fetchPriceChanges, fetchPriceTrends, daysToShow]);

  // Calculate price statistics
  const priceStats = {
    avgIncrease: 0,
    avgDecrease: 0,
    maxIncrease: 0,
    maxDecrease: 0,
    totalChanges: 0,
  };

  if (priceTrends.length > 0) {
    const increases = priceTrends.filter((t) => t.price_change_percent > 0);
    const decreases = priceTrends.filter((t) => t.price_change_percent < 0);

    priceStats.avgIncrease =
      increases.length > 0
        ? increases.reduce((sum, t) => sum + t.price_change_percent, 0) /
          increases.length
        : 0;

    priceStats.avgDecrease =
      decreases.length > 0
        ? Math.abs(
            decreases.reduce((sum, t) => sum + t.price_change_percent, 0) /
              decreases.length,
          )
        : 0;

    priceStats.maxIncrease =
      increases.length > 0
        ? Math.max(...increases.map((t) => t.price_change_percent))
        : 0;

    priceStats.maxDecrease =
      decreases.length > 0
        ? Math.abs(Math.min(...decreases.map((t) => t.price_change_percent)))
        : 0;

    priceStats.totalChanges = increases.length + decreases.length;
  }

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1f2b]">
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
            fetchPriceChanges(daysToShow);
            fetchPriceTrends();
          }}
          className="btn-ghost"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Price Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 bg-gray-800/50">
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
            </div>
          </div>
        </div>

        <div className="card p-4 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Avg. Price Decrease
              </h3>
              <p className="text-2xl font-bold text-green-400">
                {priceStats.avgDecrease.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Avg. Price Increase
              </h3>
              <p className="text-2xl font-bold text-rose-400">
                {priceStats.avgIncrease.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">
                Max Price Increase
              </h3>
              <p className="text-2xl font-bold text-amber-400">
                {priceStats.maxIncrease.toFixed(1)}%
              </p>
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
                onChange={(e) => setDaysToShow(Number(e.target.value))}
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Vendor
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Item Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                  Old Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                  New Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {priceChanges.length > 0 ? (
                priceChanges.map((change) => (
                  <tr key={change.id} className="hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(change.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {change.vendor_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {change.item_code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {change.product_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">
                      ${change.old_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 text-right">
                      ${change.new_price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span
                        className={`inline-flex items-center gap-1 ${change.change_percent > 0 ? "text-rose-400" : "text-emerald-400"}`}
                      >
                        {change.change_percent > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {Math.abs(change.change_percent)}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No price changes found in the last {daysToShow} days
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
