import React from "react";

interface LoadingScreenProps {
  progress: number;
  total: number;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  total,
  message = "Loading",
}) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#1a1f2b]/90 z-50">
      <div className="bg-[#1a1f2b] p-8 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <h3 className="text-xl font-semibold text-white">{message}</h3>
          <div className="w-full">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>
                {progress} / {total} items
              </span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-primary-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
