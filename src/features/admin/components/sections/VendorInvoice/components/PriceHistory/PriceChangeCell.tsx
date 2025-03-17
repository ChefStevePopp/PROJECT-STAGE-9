import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PriceChangeCellProps {
  value: number;
}

export const PriceChangeCell: React.FC<PriceChangeCellProps> = ({ value }) => {
  if (value === 0) return <span className="text-gray-400">0%</span>;

  return (
    <span
      className={`inline-flex items-center gap-1 ${value > 0 ? "text-rose-400" : "text-emerald-400"}`}
    >
      {value > 0 ? (
        <ArrowUpRight className="w-4 h-4" />
      ) : (
        <ArrowDownRight className="w-4 h-4" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};
