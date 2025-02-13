import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export const QuickStatCard: React.FC<Props> = ({
  title,
  value,
  change,
  trend,
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div
          className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-gray-400"}`}
        >
          {trend === "up" && <TrendingUp className="w-4 h-4" />}
          {trend === "down" && <TrendingDown className="w-4 h-4" />}
          {trend === "neutral" && <Minus className="w-4 h-4" />}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};
