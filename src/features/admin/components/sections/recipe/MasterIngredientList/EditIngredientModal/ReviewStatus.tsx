import React from "react";
import { Circle, AlertTriangle } from "lucide-react";
import { differenceInWeeks } from "date-fns";

interface ReviewStatusProps {
  lastUpdated: string;
}

export const ReviewStatus: React.FC<ReviewStatusProps> = ({ lastUpdated }) => {
  const weeksElapsed = differenceInWeeks(new Date(), new Date(lastUpdated));

  // Calculate how many bubbles should be filled
  const filledBubbles = Math.min(Math.floor(weeksElapsed / 2), 4);

  // Determine color based on filled bubbles
  const getColor = (index: number) => {
    if (index >= filledBubbles) return "text-gray-600";

    switch (filledBubbles) {
      case 1:
        return "text-emerald-400"; // 2 weeks - Green
      case 2:
        return "text-amber-400"; // 4 weeks - Orange
      case 3:
        return "text-rose-400"; // 6 weeks - Red
      case 4:
        return "text-rose-600"; // 8+ weeks - Bright Red
      default:
        return "text-gray-600";
    }
  };

  const getTooltipText = () => {
    if (weeksElapsed === 0) return "Recently updated";
    return `Last updated ${weeksElapsed} ${weeksElapsed === 1 ? "week" : "weeks"} ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-400">Review Status</span>
      <div
        className="group relative flex items-center gap-1"
        title={getTooltipText()}
      >
        {[...Array(4)].map((_, index) => (
          <Circle
            key={index}
            className={`w-3 h-3 ${getColor(index)} ${index < filledBubbles ? "fill-current" : ""}`}
          />
        ))}

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          {getTooltipText()}
        </div>
        {filledBubbles === 4 && (
          <AlertTriangle className="w-3 h-3 text-rose-600" />
        )}
      </div>
    </div>
  );
};
