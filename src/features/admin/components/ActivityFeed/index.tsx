import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Clock, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LoadingLogo } from "@/components/LoadingLogo";

interface ActivityLog {
  id: string;
  created_at: string;
  organization_id: string;
  user_id: string;
  activity_type: string;
  details: Record<string, any>;
  metadata?: Record<string, any>;
}

export const ActivityFeed: React.FC = () => {
  const { organization } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchActivities = async () => {
      if (!organization?.id) return;

      try {
        console.log("Fetching activities for org:", organization.id);
        const { data, error: fetchError } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("organization_id", organization.id)
          .order("created_at", { ascending: false })
          .limit(50);

        console.log("Activity data:", data);
        if (fetchError) throw fetchError;
        if (mounted) {
          setActivities(data || []);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        if (mounted) {
          setError("Failed to load activity logs");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchActivities();

    // Set up realtime subscription
    const channel = supabase
      .channel("activity_logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_logs",
          filter: `organization_id=eq.${organization?.id}`,
        },
        (payload) => {
          if (mounted) {
            setActivities((current) => [
              payload.new as ActivityLog,
              ...current,
            ]);
          }
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

  const formatActivityType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const renderDetails = (details: Record<string, any>) => {
    if (!details) return null;

    // Filter out internal fields and null values
    const displayableDetails = Object.entries(details).filter(
      ([key, value]) =>
        value !== null && !["id", "team_member_id"].includes(key),
    );

    return displayableDetails.map(([key, value]) => {
      // Format the key for display
      const formattedKey = key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Format the value based on its type
      let formattedValue = value;
      if (typeof value === "object") {
        if (value?.first_name && value?.last_name) {
          formattedValue = `${value.first_name} ${value.last_name}`;
        } else {
          formattedValue = JSON.stringify(value);
        }
      }

      return (
        <div key={key} className="text-sm text-gray-400">
          <span className="font-medium">{formattedKey}:</span>{" "}
          <span>{String(formattedValue)}</span>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingLogo message="Loading activity logs..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-medium text-white">Recent Activity</h2>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No activity logs found</p>
          <p className="text-sm text-gray-500 mt-1">
            Activity will appear here as team members perform actions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 bg-gray-800/50 rounded-lg flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white">
                    {activity.details?.team_member?.first_name || "Unknown"}
                  </span>
                  <span className="text-gray-400">
                    {formatActivityType(activity.activity_type)}
                  </span>
                </div>
                <div className="mt-2">{renderDetails(activity.details)}</div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
