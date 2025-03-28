import React from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Clock,
  Search,
  RefreshCw,
  ChevronDown,
  User,
  Calendar,
  AlertCircle,
  Settings,
  UtensilsCrossed,
  Package,
  Users,
  Building2,
  DollarSign,
  Bell,
  Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { LoadingLogo } from "@/components/LoadingLogo";

interface ActivityLog {
  id: string;
  created_at: string;
  activity_type: string;
  details: Record<string, any>;
  user_id: string;
  user_name?: string;
  category?: string;
  severity?: "info" | "warning" | "critical";
  acknowledged_by?: string[];
}

// Map activity types to categories
const ACTIVITY_TYPE_TO_CATEGORY = {
  recipe_created: "recipes",
  recipe_updated: "recipes",
  recipe_deleted: "recipes",
  inventory_updated: "inventory",
  team_member_added: "team",
  team_member_updated: "team",
  team_member_removed: "team",
  role_changed: "team",
  settings_updated: "system",
  task_created: "system",
  task_updated: "system",
  task_deleted: "system",
  task_completed: "system",
  task_assigned: "system",
  login: "security",
  logout: "security",
};

// Reusable components
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingLogo message="Loading activity..." />
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8">
    <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-400">{message}</p>
  </div>
);

// Activity categories with their icons and colors
const ACTIVITY_CATEGORIES_CONFIG = {
  recipes: {
    icon: UtensilsCrossed,
    color: "text-amber-400",
    label: "Recipes",
  },
  inventory: {
    icon: Package,
    color: "text-blue-400",
    label: "Inventory",
  },
  team: { icon: Users, color: "text-green-400", label: "Team" },
  organization: {
    icon: Building2,
    color: "text-purple-400",
    label: "Organization",
  },
  financial: {
    icon: DollarSign,
    color: "text-emerald-400",
    label: "Financial",
  },
  security: {
    icon: Shield,
    color: "text-rose-400",
    label: "Security",
  },
  system: {
    icon: Settings,
    color: "text-gray-400",
    label: "System",
  },
  alerts: { icon: Bell, color: "text-yellow-400", label: "Alerts" },
};

const CategoryCard = ({
  category,
  icon: Icon,
  color,
  label,
  count,
  isSelected,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center gap-3 p-4 rounded-lg transition-all
      ${
        isSelected
          ? `${color.replace("text-", "bg-")}/20 ring-2 ring-${color.replace("text-", "")}/50`
          : "bg-gray-800/50 hover:bg-gray-800 hover:ring-2 hover:ring-gray-700"
      }`}
  >
    <div
      className={`p-2 rounded-lg ${color.replace("text-", "bg-")}/10 
      group-hover:${color.replace("text-", "bg-")}/20 transition-colors`}
    >
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="flex-1 text-left">
      <span
        className={`block font-medium ${isSelected ? color : "text-gray-300 group-hover:text-white"}`}
      >
        {label}
      </span>
      <span className="text-sm text-gray-400">
        {count} {count === 1 ? "activity" : "activities"}
      </span>
    </div>
  </button>
);

const LogEntry = ({ log }: { log: ActivityLog }) => {
  const [expanded, setExpanded] = React.useState(false);
  // First check if we can derive category from activity_type, then fallback to log.category
  const derivedCategory = ACTIVITY_TYPE_TO_CATEGORY[log.activity_type];
  const category =
    derivedCategory && ACTIVITY_CATEGORIES_CONFIG[derivedCategory]
      ? derivedCategory
      : log.category && ACTIVITY_CATEGORIES_CONFIG[log.category]
        ? log.category
        : "system";
  const CategoryIcon = ACTIVITY_CATEGORIES_CONFIG[category]?.icon || Settings;

  return (
    <div
      className={`p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer
        ${log.severity === "critical" ? "border border-rose-500/50" : ""}
        ${log.severity === "warning" ? "border border-amber-500/50" : ""}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-lg ${ACTIVITY_CATEGORIES_CONFIG[category]?.color.replace("text-", "bg-")}/10`}
          >
            <CategoryIcon
              className={`w-4 h-4 ${ACTIVITY_CATEGORIES_CONFIG[category]?.color}`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">
              {log.activity_type
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
            {log.user_name && (
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <User className="w-3 h-3" />
                {log.user_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(log.created_at).toLocaleString()}
            </span>
            {log.acknowledged_by && log.acknowledged_by.length > 0 && (
              <span className="text-sm text-gray-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {log.acknowledged_by.length}{" "}
                {log.acknowledged_by.length === 1 ? "user" : "users"}{" "}
                acknowledged
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>
      {expanded && log.details && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <pre className="text-sm text-gray-400 overflow-x-auto">
            {JSON.stringify(log.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Helper function to calculate activity statistics
function calculateActivityStats(logs = []) {
  if (!logs.length)
    return {
      totalActivities: 0,
      categoryCounts: {},
      severityCounts: { info: 0, warning: 0, critical: 0 },
      recentActivities: [],
      activityTrend: "stable",
    };

  // Calculate category counts
  const categoryCounts = logs.reduce((acc, log) => {
    // First check if we can derive category from activity_type, then fallback to log.category
    const derivedCategory = ACTIVITY_TYPE_TO_CATEGORY[log.activity_type];
    const category =
      derivedCategory &&
      Object.keys(ACTIVITY_CATEGORIES_CONFIG).includes(derivedCategory)
        ? derivedCategory
        : log.category &&
            Object.keys(ACTIVITY_CATEGORIES_CONFIG).includes(log.category)
          ? log.category
          : "system";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  // Calculate severity counts
  const severityCounts = logs.reduce(
    (acc, log) => {
      const severity = log.severity || "info";
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    { info: 0, warning: 0, critical: 0 },
  );

  // Get most recent activities
  const recentActivities = logs.slice(0, 5);

  // Determine activity trend (simplified logic)
  const activityTrend =
    severityCounts.critical > 0
      ? "critical"
      : severityCounts.warning > 2
        ? "warning"
        : "stable";

  return {
    totalActivities: logs.length,
    categoryCounts,
    severityCounts,
    recentActivities,
    activityTrend,
  };
}

// Define the component as a regular function
function ActivityLogList({ onStatsCalculated } = {}) {
  const [data, setData] = React.useState({ logs: [], loading: true });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [daysFilter, setDaysFilter] = React.useState(7);
  const { organization } = useAuth();

  const fetchLogs = React.useCallback(async () => {
    if (!organization?.id) return;

    try {
      // Calculate date range based on daysFilter
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysFilter);

      const { data: logs, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("organization_id", organization.id)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      const fetchedLogs = logs || [];
      setData({ logs: fetchedLogs, loading: false });

      // Calculate and pass stats to parent component if callback provided
      if (onStatsCalculated && typeof onStatsCalculated === "function") {
        const stats = calculateActivityStats(fetchedLogs);
        onStatsCalculated(stats);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setData({ logs: [], loading: false });

      // Pass empty stats on error
      if (onStatsCalculated && typeof onStatsCalculated === "function") {
        onStatsCalculated(calculateActivityStats([]));
      }
    }
  }, [organization?.id, daysFilter, onStatsCalculated]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Calculate category counts from filtered logs
  const categoryCounts = React.useMemo(() => {
    // Initialize with all categories set to 0
    const counts = Object.keys(ACTIVITY_CATEGORIES_CONFIG).reduce(
      (acc, category) => {
        acc[category] = 0;
        return acc;
      },
      {},
    );

    // Apply the same filtering logic as filteredLogs but only for the selected filters
    // This ensures the category counts match the current filter criteria
    return data.logs
      .filter((log) => {
        // Only apply severity and search filters, not category filter
        const matchesSearch =
          !searchTerm ||
          log.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.user_name &&
            log.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSeverity =
          severityFilter === "all" || log.severity === severityFilter;

        return matchesSearch && matchesSeverity;
      })
      .reduce((acc, log) => {
        // First check if we can derive category from activity_type, then fallback to log.category
        const derivedCategory = ACTIVITY_TYPE_TO_CATEGORY[log.activity_type];
        const category =
          derivedCategory && ACTIVITY_CATEGORIES_CONFIG[derivedCategory]
            ? derivedCategory
            : log.category && ACTIVITY_CATEGORIES_CONFIG[log.category]
              ? log.category
              : "system";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, counts);
  }, [data.logs, searchTerm, severityFilter]);

  // Create activity categories with dynamic counts
  const activityCategories = React.useMemo(() => {
    return Object.entries(ACTIVITY_CATEGORIES_CONFIG).map(
      ([category, config]) => ({
        ...config,
        category,
        count: categoryCounts[category] || 0,
      }),
    );
  }, [categoryCounts]);

  // Filter logs based on selected category and search term
  const filteredLogs = React.useMemo(
    () =>
      data.logs.filter((log) => {
        // First check if we can derive category from activity_type, then fallback to log.category
        const derivedCategory = ACTIVITY_TYPE_TO_CATEGORY[log.activity_type];
        const logCategory =
          derivedCategory && ACTIVITY_CATEGORIES_CONFIG[derivedCategory]
            ? derivedCategory
            : log.category && ACTIVITY_CATEGORIES_CONFIG[log.category]
              ? log.category
              : "system";

        const matchesCategory =
          !selectedCategory || logCategory === selectedCategory;
        const matchesSearch =
          !searchTerm ||
          log.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (log.user_name &&
            log.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSeverity =
          severityFilter === "all" || log.severity === severityFilter;

        return matchesCategory && matchesSearch && matchesSeverity;
      }),
    [data.logs, selectedCategory, searchTerm, severityFilter],
  );

  if (data.loading) return <LoadingState />;

  if (!organization?.id) {
    return <EmptyState message="Please select an organization" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Activity Log</h2>
        <button
          onClick={() => {
            setData((prev) => ({ ...prev, loading: true }));
            fetchLogs();
          }}
          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          aria-label="Refresh activity logs"
          title="Refresh activity logs"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activityCategories.map(({ category, icon, color, label, count }) => (
          <CategoryCard
            key={category}
            category={category}
            icon={icon}
            color={color}
            label={label}
            count={count}
            isSelected={selectedCategory === category}
            onClick={() =>
              setSelectedCategory((prev) => (prev === category ? "" : category))
            }
          />
        ))}
      </div>

      <div className="flex gap-4 items-center bg-gray-800/50 p-4 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activities..."
            className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/50 outline-none"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-gray-900/50 border border-gray-700 rounded-lg text-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value="all">All Severities</option>
          <option value="info">Info</option>
          <option value="warning">Warnings</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          className="bg-gray-900/50 border border-gray-700 rounded-lg text-white px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500/50"
        >
          <option value={1}>Last 24 hours</option>
          <option value={3}>Last 3 days</option>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
        {filteredLogs.length === 0 && (
          <EmptyState
            message={
              searchTerm || selectedCategory || severityFilter !== "all"
                ? "No matching activities found"
                : "No activities recorded yet"
            }
          />
        )}
      </div>
    </div>
  );
}

// Export the component and the utility function
ActivityLogList.calculateActivityStats = calculateActivityStats;
export { ActivityLogList };
