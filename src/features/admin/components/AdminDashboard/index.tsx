import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { ActivityFeed } from "../ActivityFeed";
import { supabase } from "@/lib/supabase";
import { AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export const AdminDashboard: React.FC = () => {
  const { user, organization } = useAuth();
  const [daysFilter, setDaysFilter] = React.useState(7);
  const [recipeActivities, setRecipeActivities] = React.useState([]);
  const [loadingRecipes, setLoadingRecipes] = React.useState(true);
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    categoryCounts: {},
    severityCounts: { info: 0, warning: 0, critical: 0 },
    recentActivities: [],
    activityTrend: "stable",
  });

  // Fetch recipe-related activities
  useEffect(() => {
    let mounted = true;

    const fetchRecipeActivities = async () => {
      if (!organization?.id) {
        setLoadingRecipes(false);
        return;
      }

      try {
        // Calculate date range based on daysFilter
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysFilter);

        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("organization_id", organization.id)
          .in("activity_type", [
            "recipe_created",
            "recipe_updated",
            "recipe_deleted",
            "recipe_status_changed",
          ])
          .gte("created_at", startDate.toISOString())
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        if (mounted) {
          setRecipeActivities(data || []);
        }
      } catch (err) {
        console.error("Error fetching recipe activities:", err);
      } finally {
        if (mounted) {
          setLoadingRecipes(false);
        }
      }
    };

    fetchRecipeActivities();

    return () => {
      mounted = false;
    };
  }, [organization?.id, daysFilter]);

  // Recipe Activity Card component
  const RecipeActivityCard = () => {
    if (loadingRecipes) {
      return (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-white mb-2">
            Recipe Activities
          </h2>
          <div className="text-gray-400 text-sm">
            Loading recipe activities...
          </div>
        </div>
      );
    }

    return (
      <div className="card p-6">
        <h2 className="text-lg font-medium text-white mb-2">
          Recipe Activities
        </h2>
        {recipeActivities.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No recent recipe activities found.
          </p>
        ) : (
          <div className="space-y-2">
            {recipeActivities.map((activity) => (
              <div key={activity.id} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-white">{activity.activity_type}</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
                {activity.details && activity.details.recipe_name && (
                  <div className="mt-1 text-sm text-gray-400">
                    Recipe: {activity.details.recipe_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.user_metadata?.firstName || "Admin"}
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-white font-medium">Activity Time Range</div>
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="bg-gray-700 text-white rounded px-3 py-1 border border-gray-600"
          >
            <option value={1}>Last 24 hours</option>
            <option value={3}>Last 3 days</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="p-4 bg-gray-800/50 rounded-lg text-xs font-mono text-gray-400">
        <div>Organization ID: {organization?.id}</div>
        <div>User Role: {user?.user_metadata?.role || "None"}</div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipe Activities */}
        <div className="lg:col-span-1">
          <RecipeActivityCard />
        </div>

        {/* System Status */}
        <div className="card p-6">
          <h2 className="text-lg font-medium text-white mb-2">System Status</h2>
          <p className="text-gray-400 text-sm">System metrics coming soon...</p>
        </div>

        {/* Activity Stats */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-white mb-4">
              Activity Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Total Activities</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {activityStats.totalActivities}
                </div>
              </div>

              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">System Status</span>
                  {activityStats.activityTrend === "critical" ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : activityStats.activityTrend === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-lg font-medium mt-2">
                  {activityStats.activityTrend === "critical" ? (
                    <span className="text-rose-400">Critical Issues</span>
                  ) : activityStats.activityTrend === "warning" ? (
                    <span className="text-amber-400">Warnings Present</span>
                  ) : (
                    <span className="text-green-400">All Systems Normal</span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">
                Activity by Category
              </h3>
              {Object.entries(activityStats.categoryCounts).length > 0 ? (
                Object.entries(activityStats.categoryCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([category, count]) => (
                    <div
                      key={category}
                      className="flex items-center justify-between p-2 bg-gray-800/30 rounded"
                    >
                      <span className="text-white capitalize">{category}</span>
                      <span className="text-gray-400">{count} activities</span>
                    </div>
                  ))
              ) : (
                <div className="text-center py-2">
                  <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-400">
                    No activities recorded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-3">
          <ActivityFeed daysFilter={daysFilter} />
        </div>
      </div>
    </div>
  );
};
