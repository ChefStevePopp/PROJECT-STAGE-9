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
}

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
const ACTIVITY_CATEGORIES = {
  recipes: {
    icon: UtensilsCrossed,
    color: "text-amber-400",
    label: "Recipes",
    count: 0,
  },
  inventory: {
    icon: Package,
    color: "text-blue-400",
    label: "Inventory",
    count: 0,
  },
  team: { icon: Users, color: "text-green-400", label: "Team", count: 0 },
  organization: {
    icon: Building2,
    color: "text-purple-400",
    label: "Organization",
    count: 0,
  },
  financial: {
    icon: DollarSign,
    color: "text-emerald-400",
    label: "Financial",
    count: 0,
  },
  security: {
    icon: Shield,
    color: "text-rose-400",
    label: "Security",
    count: 0,
  },
  system: { icon: Settings, color: "text-gray-400", label: "System", count: 0 },
  alerts: { icon: Bell, color: "text-yellow-400", label: "Alerts", count: 0 },
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
  const category = log.category || "system";
  const CategoryIcon = ACTIVITY_CATEGORIES[category]?.icon || Settings;

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
            className={`p-2 rounded-lg ${ACTIVITY_CATEGORIES[category]?.color.replace("text-", "bg-")}/10`}
          >
            <CategoryIcon
              className={`w-4 h-4 ${ACTIVITY_CATEGORIES[category]?.color}`}
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
          <span className="text-sm text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(log.created_at).toLocaleString()}
          </span>
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

export function ActivityLogList() {
  const [data, setData] = React.useState({ logs: [], loading: true });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const { organization } = useAuth();

  const fetchLogs = React.useCallback(async () => {
    if (!organization?.id) return;

    try {
      const { data: logs, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setData({ logs: logs || [], loading: false });
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setData({ logs: [], loading: false });
    }
  }, [organization?.id]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Calculate category counts
  const categoryCounts = React.useMemo(() => {
    return data.logs.reduce((acc, log) => {
      const category = log.category || "system";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }, [data.logs]);

  // Filter logs based on selected category and search term
  const filteredLogs = React.useMemo(() => {
    return data.logs.filter((log) => {
      const matchesCategory =
        !selectedCategory || log.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        log.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_name &&
          log.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSeverity =
        severityFilter === "all" || log.severity === severityFilter;

      return matchesCategory && matchesSearch && matchesSeverity;
    });
  }, [data.logs, selectedCategory, searchTerm, severityFilter]);

  if (data.loading) return <LoadingState />;

  if (!organization?.id) {
    return <EmptyState message="Please select an organization" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Activity Log</h2>
        <button
          onClick={fetchLogs}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ACTIVITY_CATEGORIES).map(
          ([category, { icon, color, label }]) => (
            <CategoryCard
              key={category}
              category={category}
              icon={icon}
              color={color}
              label={label}
              count={categoryCounts[category] || 0}
              isSelected={selectedCategory === category}
              onClick={() =>
                setSelectedCategory((prev) =>
                  prev === category ? "" : category,
                )
              }
            />
          ),
        )}
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
