import React from "react";

interface TimeFormatToggleProps {
  timeFormat: "12h" | "24h";
  onChange: (format: "12h" | "24h") => void;
}

export const TimeFormatToggle: React.FC<TimeFormatToggleProps> = ({
  timeFormat,
  onChange,
}) => {
  return (
    <div className="flex items-center bg-gray-800/50 rounded-lg px-3 py-1">
      <span className="text-sm text-gray-400 mr-2">Time Format:</span>
      <div className="flex">
        <button
          onClick={() => onChange("12h")}
          className={`px-2 py-1 text-xs rounded-l-md ${timeFormat === "12h" ? "bg-primary-500/20 text-primary-400" : "bg-gray-700 text-gray-300"}`}
        >
          12h
        </button>
        <button
          onClick={() => onChange("24h")}
          className={`px-2 py-1 text-xs rounded-r-md ${timeFormat === "24h" ? "bg-primary-500/20 text-primary-400" : "bg-gray-700 text-gray-300"}`}
        >
          24h
        </button>
      </div>
    </div>
  );
};
