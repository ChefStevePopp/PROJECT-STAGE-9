import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { MasterIngredient } from "@/types/master-ingredient";
import { VendorPriceHistory, VendorPriceTrend } from "@/types/vendor-codes";

interface PriceHistoryViewProps {
  ingredientId?: string;
  vendorId?: string;
}

export const PriceHistoryView: React.FC<PriceHistoryViewProps> = ({
  ingredientId,
  vendorId,
}) => {
  const {
    fetchPriceHistory,
    fetchPriceTrends,
    priceHistory,
    priceTrends,
    isLoading,
    error,
  } = useVendorCodesStore();
  const { ingredients, fetchIngredients } = useMasterIngredientsStore();

  const [selectedIngredient, setSelectedIngredient] = useState<
    string | undefined
  >(ingredientId);
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>(
    vendorId,
  );
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
  const [vendors, setVendors] = useState<string[]>([]);

  // Load ingredients and vendors on mount
  useEffect(() => {
    fetchIngredients();

    // Get unique vendors from operations settings
    const getVendors = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("operations_settings")
          .select("vendors")
          .single();

        if (error) throw error;
        if (data && data.vendors) {
          setVendors(data.vendors);
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        // Set some default vendors if we can't fetch them
        setVendors(["Sysco", "US Foods", "Gordon Food Service", "Other"]);
      }
    };

    getVendors();
  }, [fetchIngredients]);

  // Load price history when selection changes
  useEffect(() => {
    if (selectedIngredient) {
      fetchPriceHistory(selectedIngredient, selectedVendor);
      fetchPriceTrends(selectedIngredient, selectedVendor);
    } else if (selectedVendor) {
      // If only vendor is selected, fetch trends for that vendor
      fetchPriceTrends(undefined, selectedVendor);
    } else {
      // If nothing is selected, fetch all trends
      fetchPriceTrends();
    }
  }, [selectedIngredient, selectedVendor, fetchPriceHistory, fetchPriceTrends]);

  // Filter price history by date range
  const filteredHistory = priceHistory.filter((record) => {
    const recordDate = new Date(record.effective_date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59); // Include the entire end day

    return recordDate >= startDate && recordDate <= endDate;
  });

  // Group trends by ingredient for the chart
  const trendsByIngredient = priceTrends.reduce(
    (acc, trend) => {
      if (!acc[trend.ingredient_name]) {
        acc[trend.ingredient_name] = [];
      }
      acc[trend.ingredient_name].push(trend);
      return acc;
    },
    {} as Record<string, VendorPriceTrend[]>,
  );

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

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <h3 className="font-medium">Error Loading Price History</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Price History & Analytics
        </h2>
        <button
          onClick={() => {
            if (selectedIngredient) {
              fetchPriceHistory(selectedIngredient, selectedVendor);
              fetchPriceTrends(selectedIngredient, selectedVendor);
            } else {
              fetchPriceTrends(undefined, selectedVendor);
            }
          }}
          className="btn-ghost"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ingredient
            </label>
            <select
              value={selectedIngredient || ""}
              onChange={(e) =>
                setSelectedIngredient(e.target.value || undefined)
              }
              className="input w-full"
            >
              <option value="">All Ingredients</option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.product}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Vendor
            </label>
            <select
              value={selectedVendor || ""}
              onChange={(e) => setSelectedVendor(e.target.value || undefined)}
              className="input w-full"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
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
      </div>

      {/* Price Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Price History Table */}
      <div className="card p-4 bg-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-4">Price History</h3>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/30 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Price History
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {selectedIngredient
                ? "No price history found for the selected ingredient and date range."
                : "Select an ingredient to view its price history."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                    Ingredient
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                    Vendor
                  </th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredHistory.map((record) => {
                  const ingredient = ingredients.find(
                    (i) => i.id === record.master_ingredient_id,
                  );
                  return (
                    <tr key={record.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {new Date(record.effective_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-white">
                        {ingredient?.product || "Unknown"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-300">
                        {record.vendor_id}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-white">
                        ${record.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-400">
                        {record.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Trends */}
      <div className="card p-4 bg-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-4">Price Trends</h3>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : Object.keys(trendsByIngredient).length === 0 ? (
          <div className="text-center py-8 bg-gray-900/30 rounded-lg">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Price Trends
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No price trend data available for the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(trendsByIngredient).map(
              ([ingredientName, trends]) => {
                // Sort trends by date
                const sortedTrends = [...trends].sort(
                  (a, b) =>
                    new Date(a.effective_date).getTime() -
                    new Date(b.effective_date).getTime(),
                );

                // Calculate overall price change
                const firstPrice = sortedTrends[0]?.price || 0;
                const lastPrice =
                  sortedTrends[sortedTrends.length - 1]?.price || 0;
                const overallChange =
                  firstPrice > 0
                    ? ((lastPrice - firstPrice) / firstPrice) * 100
                    : 0;

                return (
                  <div
                    key={ingredientName}
                    className="bg-gray-900/30 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">
                        {ingredientName}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">
                          ${firstPrice.toFixed(2)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <span className="text-white font-medium">
                          ${lastPrice.toFixed(2)}
                        </span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                            overallChange > 0
                              ? "bg-rose-500/20 text-rose-400"
                              : overallChange < 0
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {overallChange > 0 ? "+" : ""}
                          {overallChange.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Simple price chart */}
                    <div className="h-24 relative mt-2">
                      {sortedTrends.map((trend, index) => {
                        // Skip the first one as we need previous to calculate change
                        if (index === 0) return null;

                        const prev = sortedTrends[index - 1];
                        const change = trend.price_change_percent;
                        const date = new Date(
                          trend.effective_date,
                        ).toLocaleDateString();

                        return (
                          <div
                            key={trend.id}
                            className="absolute bottom-0 transform -translate-x-1/2"
                            style={{
                              left: `${(index / (sortedTrends.length - 1)) * 100}%`,
                              height: "100%",
                            }}
                          >
                            <div className="h-full flex flex-col justify-end items-center">
                              <div
                                className={`w-1 ${change > 0 ? "bg-rose-500/50" : "bg-green-500/50"}`}
                                style={{
                                  height: `${Math.min(Math.abs(change) * 2, 80)}%`,
                                }}
                              ></div>
                              <div className="text-xs text-gray-500 mt-1">
                                {date}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
};
