import React from "react";
import {
  TrendingUp,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  History,
} from "lucide-react";
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
  // This would come from your store in a real implementation
  const recentChanges: PriceChange[] = [
    {
      id: "1",
      vendor: "Sysco",
      item_code: "SYS123",
      product_name: "Chicken Breast",
      old_price: 45.99,
      new_price: 48.99,
      change_percent: 6.5,
      date: "2024-03-28",
    },
    {
      id: "2",
      vendor: "US Foods",
      item_code: "USF456",
      product_name: "Ground Beef",
      old_price: 32.99,
      new_price: 29.99,
      change_percent: -9.1,
      date: "2024-03-27",
    },
    // Add more mock data as needed
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
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
          <h4 className="text-lg font-medium text-white">
            Recent Price Changes
          </h4>
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
              {recentChanges.map((change) => (
                <tr key={change.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(change.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {change.vendor}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
