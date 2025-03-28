import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Clock, RefreshCw, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LoadingLogo } from "@/components/LoadingLogo";

export const ActivityFeed = ({ daysFilter = 7 }) => {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { organization } = useAuth();

  const fetchLogs = React.useCallback(async () => {
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Calculate date range based on daysFilter
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysFilter);

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("organization_id", organization.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, daysFilter]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Format activity type to be more readable
  const formatActivityType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Format the activity details into a readable string
  const formatActivityDetails = (details) => {
    if (!details) return "";

    if (details.recipe_name) {
      return `${details.recipe_name}`;
    } else if (details.user_name) {
      return `by ${details.user_name}`;
    } else if (details.update_type) {
      return `Changes: ${details.update_type}`;
    }

    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingLogo message="Loading activity..." />
      </div>
    );
  }

  if (!organization?.id) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400">Please select an organization</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-white">Activity Log</h2>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm"
          aria-label="Refresh activity logs"
          title="Refresh activity logs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const activityTitle = formatActivityType(log.activity_type);
            const activityDetails = formatActivityDetails(log.details);
            const formattedDate = new Date(log.created_at).toLocaleString(
              undefined,
              {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              },
            );

            return (
              <div
                key={log.id}
                className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-white font-medium">
                      {activityTitle}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formattedDate}
                    </span>
                  </div>

                  {activityDetails && (
                    <p className="text-gray-300 text-sm">{activityDetails}</p>
                  )}

                  {log.details && log.details.user_name && (
                    <div className="flex items-center gap-1 mt-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {log.details.user_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
