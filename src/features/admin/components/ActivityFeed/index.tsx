import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LoadingLogo } from "@/components/LoadingLogo";

export const ActivityFeed = () => {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { organization } = useAuth();

  React.useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("organization_id", organization.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        if (mounted) {
          setLogs(data || []);
        }
      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      mounted = false;
    };
  }, [organization?.id]);

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
      <h2 className="text-lg font-medium text-white">Activity Log</h2>
      {logs.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-white">{log.activity_type}</span>
                <span className="text-gray-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              {log.details && (
                <pre className="mt-2 text-sm text-gray-400 overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
