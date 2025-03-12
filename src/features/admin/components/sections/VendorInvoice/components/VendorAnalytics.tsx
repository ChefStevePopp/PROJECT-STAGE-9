import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Search,
} from "lucide-react";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";

export const VendorAnalytics: React.FC = () => {
  const {
    fetchPriceTrends,
    fetchPriceHistory,
    priceTrends,
    priceHistory,
    isLoading,
    error,
  } = useVendorCodesStore();
  const { ingredients, fetchIngredients } = useMasterIngredientsStore();

  // State for detailed price history view
  const [selectedIngredient, setSelectedIngredient] = useState<
    string | undefined
  >();
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(
    () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6); // Default to last 6 months
      return {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      };
    },
  );
  const [vendors, setVendors] = useState<string[]>([]);
  const [vendorStats, setVendorStats] = useState<
    Record<
      string,
      {
        totalItems: number;
        avgIncrease: number;
        avgDecrease: number;
        totalChanges: number;
        overallChange: number;
      }
    >
  >({});

  // Load ingredients, vendors, price trends, and history on mount
  useEffect(() => {
    fetchIngredients();
    fetchPriceTrends();

    // If ingredient is selected, fetch its price history
    if (selectedIngredient) {
      fetchPriceHistory(selectedIngredient, selectedVendor);
    }

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
  }, [
    fetchIngredients,
    fetchPriceTrends,
    fetchPriceHistory,
    selectedIngredient,
    selectedVendor,
  ]);

  // Calculate vendor statistics
  useEffect(() => {
    if (priceTrends.length === 0) return;

    // Group trends by vendor
    const trendsByVendor = priceTrends.reduce(
      (acc, trend) => {
        if (!acc[trend.vendor_id]) {
          acc[trend.vendor_id] = [];
        }
        acc[trend.vendor_id].push(trend);
        return acc;
      },
      {} as Record<string, typeof priceTrends>,
    );

    // Calculate stats for each vendor
    const stats: Record<string, any> = {};

    Object.entries(trendsByVendor).forEach(([vendor, trends]) => {
      // Get unique ingredients
      const uniqueIngredients = new Set(
        trends.map((t) => t.master_ingredient_id),
      );

      // Calculate increases and decreases
      const increases = trends.filter((t) => t.price_change_percent > 0);
      const decreases = trends.filter((t) => t.price_change_percent < 0);

      // Calculate overall change by ingredient
      const ingredientChanges = Array.from(uniqueIngredients).map(
        (ingredientId) => {
          const ingredientTrends = trends
            .filter((t) => t.master_ingredient_id === ingredientId)
            .sort(
              (a, b) =>
                new Date(a.effective_date).getTime() -
                new Date(b.effective_date).getTime(),
            );

          if (ingredientTrends.length < 2) return 0;

          const firstPrice = ingredientTrends[0].price;
          const lastPrice = ingredientTrends[ingredientTrends.length - 1].price;

          return ((lastPrice - firstPrice) / firstPrice) * 100;
        },
      );

      // Calculate average overall change
      const overallChange =
        ingredientChanges.length > 0
          ? ingredientChanges.reduce((sum, change) => sum + change, 0) /
            ingredientChanges.length
          : 0;

      stats[vendor] = {
        totalItems: uniqueIngredients.size,
        avgIncrease:
          increases.length > 0
            ? increases.reduce((sum, t) => sum + t.price_change_percent, 0) /
              increases.length
            : 0,
        avgDecrease:
          decreases.length > 0
            ? Math.abs(
                decreases.reduce((sum, t) => sum + t.price_change_percent, 0) /
                  decreases.length,
              )
            : 0,
        totalChanges: increases.length + decreases.length,
        overallChange,
      };
    });

    setVendorStats(stats);
  }, [priceTrends]);

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <h3 className="font-medium">Error Loading Vendor Analytics</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Vendor Analytics</h2>
        <button onClick={() => fetchPriceTrends()} className="btn-ghost">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card p-4 bg-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Vendor Comparison */}
      <div className="card p-4 bg-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-4">
          Vendor Comparison
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : Object.keys(vendorStats).length === 0 ? (
          <div className="text-center py-8 bg-gray-900/30 rounded-lg">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Vendor Data
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No vendor price data available for analysis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                    Vendor
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                    Items
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                    Price Changes
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                    Avg. Increase
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                    Avg. Decrease
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-medium text-gray-400">
                    Overall Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {Object.entries(vendorStats)
                  .sort((a, b) => b[1].totalItems - a[1].totalItems) // Sort by total items
                  .map(([vendor, stats]) => (
                    <tr key={vendor} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        {vendor}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-300">
                        {stats.totalItems}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-300">
                        {stats.totalChanges}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="text-rose-400">
                          {stats.avgIncrease.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className="text-green-400">
                          {stats.avgDecrease.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-2">
                          {stats.overallChange > 0 ? (
                            <TrendingUp className="w-4 h-4 text-rose-400" />
                          ) : stats.overallChange < 0 ? (
                            <TrendingDown className="w-4 h-4 text-green-400" />
                          ) : (
                            <span className="w-4 h-4 inline-block">-</span>
                          )}
                          <span
                            className={`font-medium ${
                              stats.overallChange > 0
                                ? "text-rose-400"
                                : stats.overallChange < 0
                                  ? "text-green-400"
                                  : "text-gray-400"
                            }`}
                          >
                            {stats.overallChange > 0 ? "+" : ""}
                            {stats.overallChange.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Volatility by Category */}
      <div className="card p-4 bg-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-4">
          Price Volatility by Category
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : priceTrends.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/30 rounded-lg">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Category Data
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              No category price data available for analysis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This would be a more complex visualization in a real app */}
            {/* For now, we'll just show a placeholder */}
            <div className="bg-gray-900/30 rounded-lg p-4 flex flex-col items-center justify-center h-48">
              <BarChart3 className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-gray-400 text-center">
                Category price volatility chart would be displayed here.
              </p>
            </div>

            <div className="bg-gray-900/30 rounded-lg p-4 flex flex-col items-center justify-center h-48">
              <DollarSign className="w-8 h-8 text-gray-600 mb-2" />
              <p className="text-gray-400 text-center">
                Category price comparison chart would be displayed here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Price History */}
      <div className="card p-4 bg-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">
            Detailed Price History
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              {ingredients
                .filter(
                  (i) =>
                    !searchTerm ||
                    i.product.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((ingredient) => (
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

          <div className="flex items-end">
            <button
              onClick={() => {
                if (selectedIngredient) {
                  fetchPriceHistory(selectedIngredient, selectedVendor);
                }
                fetchPriceTrends(selectedIngredient, selectedVendor);
              }}
              className="btn-primary w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* Price History Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : priceHistory.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/30 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Price History
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {selectedIngredient
                ? "No price history found for the selected ingredient."
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
                {priceHistory.map((record) => {
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

      {/* Recommendations */}
      <div className="card p-4 bg-gray-800/50">
        <h3 className="text-lg font-medium text-white mb-4">Recommendations</h3>

        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">Vendor Insights</h4>
            <p className="text-gray-300">
              Based on price trend analysis, consider reviewing your purchasing
              strategy with vendors showing consistent price increases.
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-400 mb-2">
              Cost Saving Opportunities
            </h4>
            <p className="text-gray-300">
              Identify ingredients with high price volatility and consider
              alternative sourcing or substitution options.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-medium text-amber-400 mb-2">Seasonal Trends</h4>
            <p className="text-gray-300">
              Monitor seasonal price fluctuations to optimize purchasing timing
              and inventory management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
