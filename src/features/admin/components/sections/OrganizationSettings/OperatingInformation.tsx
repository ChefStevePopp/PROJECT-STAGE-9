import React from "react";
import { useAuth } from "@/hooks/useAuth";

export const OperatingInformation: React.FC = () => {
  const { organization } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">
          Operating Information
        </h3>
        <p className="text-gray-400">
          Configure your organization's operating details and hours.
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6">
        <p className="text-gray-400">
          Operating information configuration will be available soon.
        </p>
      </div>
    </div>
  );
};
