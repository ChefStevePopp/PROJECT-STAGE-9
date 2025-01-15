import React from "react";
import { LucideIcon } from "lucide-react";

interface QuickStatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: string;
  color: "blue" | "emerald" | "purple" | "amber" | "rose";
}

export const QuickStatCard: React.FC<QuickStatCardProps> = ({
  icon: Icon,
  title,
  value,
  trend,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    purple: "bg-purple-500/20 text-purple-400",
    amber: "bg-amber-500/20 text-amber-400",
    rose: "bg-rose-500/20 text-rose-400",
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && <span className="text-xs text-gray-400">{trend}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
