import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ActivityFeed } from "../ActivityFeed";

export const AdminDashboard: React.FC = () => {
  const { user, organization } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.user_metadata?.firstName || "Admin"}
        </p>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="p-4 bg-gray-800/50 rounded-lg text-xs font-mono text-gray-400">
        <div>Organization ID: {organization?.id}</div>
        <div>User Role: {user?.user_metadata?.role || "None"}</div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-medium text-white mb-2">Quick Actions</h2>
          <p className="text-gray-400 text-sm">
            Dashboard content coming soon...
          </p>
        </div>

        {/* System Status */}
        <div className="card p-6">
          <h2 className="text-lg font-medium text-white mb-2">System Status</h2>
          <p className="text-gray-400 text-sm">System metrics coming soon...</p>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};
