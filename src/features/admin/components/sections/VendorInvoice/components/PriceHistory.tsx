import React from "react";
import {
  TrendingUp,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  History,
  AlertTriangle,
} from "lucide-react";
import { useVendorPriceChangesStore } from "@/stores/vendorPriceChangesStore";
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
  const [daysToShow, setDaysToShow] = React.useState(45);
  const { priceChanges, isLoading, error, fetchPriceChanges } =
    useVendorPriceChangesStore();

  React.useEffect(() => {
    fetchPriceChanges(daysToShow);
  }, [fetchPriceChanges, daysToShow]);

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
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-[#1a1f2b]">
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStatCard
          title="Price Changes (30d)"
          value="124"
          change="+12%"
          trend="up"
        />
        <QuickStatCard
          title="Avg Price Impact"
          value="$2.45"
          change="+$0.32"
          trend="up"
        />
        <QuickStatCard
          title="Items Updated"
          value="1,432"
          change="+89"
          trend="up"
        />
        <QuickStatCard
          title="Pending Reviews"
          value="23"
          change="-5"
          trend="down"
        />
      </div>

      {/* Recent Price Changes */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-between">
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
          <button className="btn-ghost btn-sm">
            <History className="w-4 h-4 mr-2" />
            View All
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
