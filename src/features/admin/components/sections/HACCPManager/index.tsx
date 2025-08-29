import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileCheck,
  Plus,
  Search,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Upload,
  Wifi,
  WifiOff,
  Settings,
  RefreshCw,
  Battery,
  MapPin,
  Activity,
  Edit,
  Copy,
  Trash2,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  Calendar as CalendarIcon,
  FileText,
  PieChart,
  HelpCircle,
  LineChart,
  X,
  ChefHat,
  Sunrise,
  Sunset,
  CookingPot,
  ZoomIn,
} from "lucide-react";

const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center mb-4">
      <Icon className="h-7 w-7 text-primary-500" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mb-6">{description}</p>
    <div className="flex gap-3">
      <button className="btn-primary">
        <Plus className="h-4 w-4 mr-2" />
        Add New Record
      </button>
      <button className="btn-ghost">
        <Upload className="h-4 w-4 mr-2" />
        Import Data
      </button>
    </div>
  </div>
);

// Temperature Data Modal Component
const TemperatureDataModal = ({
  isOpen,
  onClose,
  sensor,
  readings,
  formatTimeWithTimezone,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(24);
  const [isLoading, setIsLoading] = useState(false);

  const timeRangeOptions = [
    { value: 1, label: "1 Hour" },
    { value: 4, label: "4 Hours" },
    { value: 12, label: "12 Hours" },
    { value: 24, label: "24 Hours" },
    { value: 48, label: "48 Hours" },
    { value: 168, label: "7 Days" },
    { value: 720, label: "30 Days" },
  ];

  const filteredReadings = useMemo(() => {
    if (!sensor || !readings.length) return [];

    const now = new Date();
    const startTime = new Date(
      now.getTime() - selectedTimeRange * 60 * 60 * 1000,
    );

    return readings
      .filter(
        (r) =>
          r.sensor_id === sensor.id && new Date(r.observed_at) >= startTime,
      )
      .sort(
        (a, b) =>
          new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime(),
      );
  }, [sensor, readings, selectedTimeRange]);

  const chartData = useMemo(() => {
    if (!filteredReadings.length)
      return {
        temperatures: [],
        timestamps: [],
        minTemp: 0,
        maxTemp: 100,
        tempRange: 100,
      };

    const temperatures = filteredReadings.map((r) => r.temperature || 0);
    const timestamps = filteredReadings.map((r) => r.observed_at);
    const minTemp = Math.min(...temperatures) - 5;
    const maxTemp = Math.max(...temperatures) + 5;
    const tempRange = maxTemp - minTemp;

    return { temperatures, timestamps, minTemp, maxTemp, tempRange };
  }, [filteredReadings]);

  const getTemperatureColor = (temp) => {
    if (temp > 45) return "#EF4444"; // Red for critical
    if (temp > 41) return "#F59E0B"; // Amber for warning
    return "#10B981"; // Green for normal
  };

  const stats = useMemo(() => {
    if (!filteredReadings.length) return null;

    const temps = filteredReadings.map((r) => r.temperature).filter(Boolean);
    const avgTemp = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const violations = temps.filter((temp) => temp > 41).length;

    return {
      average: avgTemp.toFixed(1),
      minimum: minTemp.toFixed(1),
      maximum: maxTemp.toFixed(1),
      violations,
      complianceRate: (
        ((temps.length - violations) / temps.length) *
        100
      ).toFixed(1),
    };
  }, [filteredReadings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Temperature Data - {sensor?.name}
              </h2>
              <p className="text-sm text-gray-400">
                {sensor?.location_name || "Unassigned"} • Diagnostic View
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(parseInt(e.target.value))}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md flex items-center justify-center transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.average}°F
                </div>
                <div className="text-sm text-gray-400">Average</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.minimum}°F
                </div>
                <div className="text-sm text-gray-400">Minimum</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {stats.maximum}°F
                </div>
                <div className="text-sm text-gray-400">Maximum</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">
                  {stats.violations}
                </div>
                <div className="text-sm text-gray-400">Violations</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {stats.complianceRate}%
                </div>
                <div className="text-sm text-gray-400">Compliance</div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Temperature Trend
              </h3>
              <div className="text-sm text-gray-400">
                {filteredReadings.length} readings over{" "}
                {
                  timeRangeOptions.find(
                    (opt) => opt.value === selectedTimeRange,
                  )?.label
                }
              </div>
            </div>

            {filteredReadings.length > 0 ? (
              <div className="h-80 relative">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* Grid lines */}
                  {[10, 25, 50, 75, 90].map((percent) => (
                    <line
                      key={percent}
                      x1="8"
                      y1={`${percent}%`}
                      x2="95%"
                      y2={`${percent}%`}
                      stroke="#374151"
                      strokeWidth="0.2"
                      opacity="0.4"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  {/* Vertical time grid lines */}
                  {[20, 40, 60, 80].map((percent) => (
                    <line
                      key={`v-${percent}`}
                      x1={`${percent}%`}
                      y1="10%"
                      x2={`${percent}%`}
                      y2="90%"
                      stroke="#374151"
                      strokeWidth="0.1"
                      opacity="0.3"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  {/* Temperature threshold line (41°F for fridges) */}
                  {chartData.tempRange > 0 && (
                    <line
                      x1="8"
                      y1={`${90 - ((41 - chartData.minTemp) / chartData.tempRange) * 80}%`}
                      x2="95%"
                      y2={`${90 - ((41 - chartData.minTemp) / chartData.tempRange) * 80}%`}
                      stroke="#F59E0B"
                      strokeWidth="0.3"
                      strokeDasharray="2,2"
                      opacity="0.8"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}

                  {/* Temperature line */}
                  {chartData.temperatures.length > 1 &&
                    chartData.tempRange > 0 && (
                      <path
                        d={chartData.temperatures
                          .map((temp, index) => {
                            const x =
                              8 +
                              (index / (chartData.temperatures.length - 1)) *
                                87;
                            const y =
                              90 -
                              ((temp - chartData.minTemp) /
                                chartData.tempRange) *
                                80;
                            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="0.4"
                        opacity="0.9"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                  {/* Data points with enhanced visibility */}
                  {chartData.temperatures.map((temp, index) => {
                    if (chartData.tempRange === 0) return null;
                    const x =
                      8 +
                      (index / Math.max(1, chartData.temperatures.length - 1)) *
                        87;
                    const y =
                      90 -
                      ((temp - chartData.minTemp) / chartData.tempRange) * 80;
                    const color = getTemperatureColor(temp);

                    return (
                      <g key={index}>
                        {/* Outer glow */}
                        <circle
                          cx={x}
                          cy={y}
                          r="1.2"
                          fill={color}
                          opacity="0.3"
                        />
                        {/* Main point */}
                        <circle
                          cx={x}
                          cy={y}
                          r="0.8"
                          fill={color}
                          stroke="white"
                          strokeWidth="0.3"
                          opacity="1"
                          vectorEffect="non-scaling-stroke"
                        />
                        {/* Center highlight */}
                        <circle
                          cx={x}
                          cy={y}
                          r="0.3"
                          fill="white"
                          opacity="0.8"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Y-axis labels positioned absolutely */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 py-4">
                  <span className="-ml-2">
                    {chartData.maxTemp.toFixed(0)}°F
                  </span>
                  <span className="-ml-2">
                    {((chartData.maxTemp + chartData.minTemp) / 2).toFixed(0)}°F
                  </span>
                  <span className="-ml-2">
                    {chartData.minTemp.toFixed(0)}°F
                  </span>
                </div>

                {/* X-axis time labels */}
                <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs text-gray-400 pb-2">
                  {chartData.timestamps.length > 0 &&
                    [
                      chartData.timestamps[chartData.timestamps.length - 1],
                      chartData.timestamps[
                        Math.floor(chartData.timestamps.length * 0.75)
                      ],
                      chartData.timestamps[
                        Math.floor(chartData.timestamps.length * 0.5)
                      ],
                      chartData.timestamps[
                        Math.floor(chartData.timestamps.length * 0.25)
                      ],
                      chartData.timestamps[0],
                    ].map((timestamp, index) => (
                      <span
                        key={index}
                        className="text-center"
                        style={{ fontSize: "10px" }}
                      >
                        {new Date(timestamp).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    ))}
                </div>

                {/* 41°F threshold label */}
                {chartData.tempRange > 0 && (
                  <div
                    className="absolute left-10 text-xs text-amber-400 font-medium"
                    style={{
                      top: `${10 + ((chartData.maxTemp - 41) / chartData.tempRange) * 80}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    41°F Limit
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Data Available</p>
                  <p className="text-sm">
                    No temperature readings found for the selected time range
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Readings Table */}
          <div className="bg-gray-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Readings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 text-gray-300">Time</th>
                    <th className="text-left py-2 text-gray-300">
                      Temperature
                    </th>
                    <th className="text-left py-2 text-gray-300">Humidity</th>
                    <th className="text-left py-2 text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReadings
                    .slice(-20)
                    .reverse()
                    .map((reading, index) => {
                      const temp = reading.temperature || 0;
                      const status =
                        temp > 45
                          ? "critical"
                          : temp > 41
                            ? "warning"
                            : "normal";
                      const statusColor =
                        status === "critical"
                          ? "text-red-400"
                          : status === "warning"
                            ? "text-amber-400"
                            : "text-green-400";

                      return (
                        <tr
                          key={reading.id}
                          className="border-b border-gray-700/50"
                        >
                          <td className="py-2 text-gray-300">
                            {formatTimeWithTimezone(reading.observed_at)}
                          </td>
                          <td className="py-2 text-white font-medium">
                            {temp.toFixed(1)}°F
                          </td>
                          <td className="py-2 text-gray-300">
                            {reading.humidity
                              ? `${reading.humidity.toFixed(1)}%`
                              : "--"}
                          </td>
                          <td className={`py-2 font-medium ${statusColor}`}>
                            {status === "critical"
                              ? "Critical"
                              : status === "warning"
                                ? "Warning"
                                : "Normal"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>

              {filteredReadings.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No readings available for the selected time range</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemperatureCard = ({
  title,
  temp,
  status,
  time,
  location,
  isConnected = false,
  batteryLevel,
  sensorId,
  onAssignLocation,
  onEdit,
  onRefresh,
  onDelete,
  onViewData,
}) => {
  const { organization } = useAuth();

  // Get user's timezone from organization settings, default to 'America/Toronto'
  const userTimezone =
    organization?.settings?.default_timezone || "America/Toronto";
  const timeFormat = organization?.settings?.time_format || "12h";

  // Format time in user's timezone with timezone abbreviation
  const formatTimeInUserTimezone = (timeString) => {
    if (
      !timeString ||
      timeString === "Never" ||
      timeString === "No sensor data"
    ) {
      return timeString;
    }

    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Return original if invalid date
      }

      const options = {
        timeZone: userTimezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: timeFormat === "12h",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
        timeZoneName: "short", // This adds the timezone abbreviation like EST, PST, etc.
      };

      return date.toLocaleString("en-US", options);
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString; // Return original on error
    }
  };

  const formattedTime = formatTimeInUserTimezone(time);
  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "bg-green-500/20 text-green-400 border-green-500/20";
      case "warning":
        return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  const getBatteryColor = () => {
    if (!batteryLevel) return "text-gray-400";
    if (batteryLevel > 3.0) return "text-green-500";
    if (batteryLevel > 2.5) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-gray-700/30 relative group"
      onClick={() => onViewData?.(sensorId)}
      title="Click to view temperature history"
    >
      {/* Click overlay indicator */}
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />

      {/* 1. Sensor Name */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <h3
            className="text-lg font-medium text-gray-100 truncate"
            title={`Sensor: ${title}`}
          >
            {title}
          </h3>
          {isConnected ? (
            <Wifi
              className="h-4 w-4 text-green-500 flex-shrink-0"
              title="Connected"
            />
          ) : (
            <WifiOff
              className="h-4 w-4 text-red-500 flex-shrink-0"
              title="Disconnected"
            />
          )}
        </div>
      </div>

      {/* 2. Status Badge and Icons */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm px-3 py-1 rounded-md border backdrop-blur-sm ${getStatusColor()}`}
          >
            {status === "normal"
              ? "Normal"
              : status === "warning"
                ? "Warning"
                : "Critical"}
          </span>
        </div>
        <div className="flex gap-2 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh?.(sensorId);
            }}
            className="w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-md flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-blue-500/20"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(sensorId);
            }}
            className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 rounded-md flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-green-500/20"
            title="Edit Sensor"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(
                  "Are you sure you want to remove this sensor from the view? This will not delete the sensor configuration.",
                )
              ) {
                onDelete?.(sensorId);
              }
            }}
            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-md flex items-center justify-center transition-all duration-200 backdrop-blur-sm border border-red-500/20"
            title="Remove from View"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. Temperature Data */}
      <div className="mb-4">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-white">{temp}</span>
          <span className="text-gray-400 text-lg mb-1">°F</span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <BarChart3 className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* 4. Refresh Data | Location | Battery Life */}
      <div className="flex items-center justify-between text-sm text-gray-400 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span
            className={
              location === "Unassigned" ? "text-amber-400 font-medium" : ""
            }
          >
            {location}
          </span>
        </div>
        {batteryLevel && (
          <div className="flex items-center gap-1">
            <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
            <span className={getBatteryColor()}>
              {batteryLevel.toFixed(1)}V
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const TemperatureLog = ({
  title,
  description,
  icon: Icon,
  getEquipmentCards,
  getSensorTemperatureCards,
  sensors,
  equipmentType,
  onAddEquipment,
  integration,
  readings,
  equipment,
}) => {
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary-500" />
          </div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChart(!showChart)}
            className={`btn-ghost ${showChart ? "bg-blue-500/20 text-blue-400" : ""}`}
          >
            <LineChart className="h-5 w-5 mr-2" />
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>
          <button className="btn-ghost">
            <Download className="h-5 w-5 mr-2" />
          </button>
          <button className="btn-ghost">
            <Search className="h-5 w-5 mr-2" />
          </button>
          <button onClick={onAddEquipment} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </button>
        </div>
      </div>
      <p className="text-gray-400 mb-6">{description}</p>

      {/* Temperature Chart Section */}
      {showChart && (
        <div className="mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-white">
                {equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1)}{" "}
                Temperature Trends
              </h3>
            </div>
            <TemperatureChart
              readings={readings}
              sensors={sensors}
              equipment={equipment}
              equipmentTypeFilter={equipmentType}
              timeRange={24}
              showControls={true}
              height="h-64"
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Recent Readings</h3>
          <button className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Equipment cards */}
          {getEquipmentCards && getEquipmentCards(equipmentType)}
          {/* Sensor cards for unassigned sensors */}
          {getSensorTemperatureCards &&
            getSensorTemperatureCards(equipmentType)}
          {/* Show message if no equipment or sensors */}
          {(!getEquipmentCards ||
            getEquipmentCards(equipmentType)?.length === 0) &&
            (!getSensorTemperatureCards ||
              getSensorTemperatureCards(equipmentType)?.length === 0) && (
              <div className="col-span-full text-center py-8 text-gray-400">
                <Thermometer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  No {equipmentType.replace("-", " ")} configured
                </p>
                <p className="text-sm">
                  {integration
                    ? "Add equipment or sync sensors to start monitoring temperatures"
                    : "Set up SensorPush integration to automatically monitor temperatures"}
                </p>
              </div>
            )}
        </div>
      </div>
      {/* Expandable Info Section */}
      <div className="expandable-info-section mb-6">
        <button
          className="expandable-info-header w-full flex justify-between items-center"
          onClick={() => setIsInfoExpanded(!isInfoExpanded)}
        >
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 text-amber-400 mr-2" />
            <h3 className="text-xl font-medium text-white">
              What is a List Module?
            </h3>
          </div>
          <div className="ml-auto">
            {isInfoExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400 transform transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400 transform transition-transform duration-200" />
            )}
          </div>
        </button>
        {isInfoExpanded && (
          <div className="expandable-info-content mt-4">
            <p className="text-gray-400 mb-6">
              A list module equates to a single line of a hand-written prep list
              or check list. By making your lists modular, you create your lists
              on the fly like your would traditionally, but with the efficiency
              of drag and drop. The best part, no writing the prep list from
              scratch each time! Modules can include both free-standing list
              items and items linked to recipes or prep items.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-white mb-3">
                  Features
                </h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Create modules for different stations and shifts
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Link list items to recipes and prep items
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Set item sequence and estimated times
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Support for SCHEDULE by DAY prep systems
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Support for PAR-based inventory prep systems
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Support for As-Needed prep systems
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                    Assign kitchen stations for access control
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-3">
                  Module Categories
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <ChefHat className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-gray-400">
                      Prep - Daily preparation tasks
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CookingPot className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-gray-400">
                      Production - Service preparation
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Sunrise className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-gray-400">
                      Opening - Start of day procedures
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Sunset className="h-4 w-4 text-rose-500 mr-2" />
                    <span className="text-gray-400">
                      Closing - End of day procedures
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-gray-400">
                      Station Access - Control which stations can use each
                      module
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="expandable-info-section">
        <div className="flex items-center gap-2 text-amber-600 p-4">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Temperature Compliance Guidelines</span>
        </div>
        <ul className="text-sm text-gray-400 space-y-2 p-4 pt-0">
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>
              Refrigerators must maintain temperatures at or below 41°F (5°C)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>Check temperatures at least twice daily</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>
              Document all temperature readings and corrective actions
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <span>
              If temperature exceeds 41°F, take immediate corrective action
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Import the BoardOfHealth component
import { BoardOfHealth } from "../../settings/OrganizationSettings/BoardOfHealth";
import { ReportsAnalytics } from "./components/ReportsAnalytics";
import { TemperatureChart } from "./components/TemperatureChart";
import { useAuth } from "@/hooks/useAuth";
import { useSensorPush } from "@/hooks/useSensorPush";
import { useOperationsStore } from "@/stores/operationsStore";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Equipment Configuration Modal
const EquipmentConfigModal = ({
  isOpen,
  onClose,
  onSave,
  equipment = null,
  allEquipment = [],
  sensors = [],
  getLatestReading = () => null,
}) => {
  const { settings: operationsSettings, fetchSettings } = useOperationsStore();
  const [name, setName] = useState(equipment?.name || "");
  const [equipmentType, setEquipmentType] = useState(
    equipment?.equipment_type || "fridge",
  );
  const [locationName, setLocationName] = useState(
    equipment?.location_name || "",
  );
  const [stationAssignment, setStationAssignment] = useState(
    equipment?.station_assignment || "",
  );
  const [notes, setNotes] = useState(equipment?.notes || "");
  const [selectedSensorId, setSelectedSensorId] = useState(
    equipment?.sensor_id || "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !locationName.trim()) {
      toast.error("Name and location are required");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        id: equipment?.id,
        name: name.trim(),
        equipment_type: equipmentType,
        location_name: locationName.trim(),
        station_assignment: stationAssignment.trim() || null,
        notes: notes.trim() || null,
        sensor_id: selectedSensorId || null,
      });
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName(equipment?.name || "");
    setEquipmentType(equipment?.equipment_type || "fridge");
    setLocationName(equipment?.location_name || "");
    setStationAssignment(equipment?.station_assignment || "");
    setNotes(equipment?.notes || "");
    setSelectedSensorId(equipment?.sensor_id || "");
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
      // Fetch operations settings if not already loaded
      if (!operationsSettings) {
        fetchSettings();
      }
    }
  }, [isOpen, equipment, operationsSettings, fetchSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {equipment ? "Edit Equipment" : "Add New Equipment"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Equipment Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="e.g., Walk-in Cooler #1, Main Freezer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Equipment Type *
            </label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="fridge">Fridge/Cooler</option>
              <option value="freezer">Freezer</option>
              <option value="hot_holding">Hot Holding</option>
              <option value="cold_holding">Cold Holding</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location *
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="e.g., Main Kitchen, External, Outdoor Storage"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Examples: Main Kitchen, Prep Area, Bar Area, External, Outdoor
              Storage
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Station Assignment
            </label>
            <select
              value={stationAssignment}
              onChange={(e) => setStationAssignment(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="">Select a station (optional)</option>
              {operationsSettings?.kitchen_stations?.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select from configured kitchen stations or leave blank
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Assign SensorPush Sensor (Optional)
            </label>
            <select
              value={selectedSensorId}
              onChange={(e) => {
                const sensorId = e.target.value;
                setSelectedSensorId(sensorId);
                // Auto-populate name and location from sensor data
                if (sensorId) {
                  const sensor = sensors.find((s) => s.id === sensorId);
                  if (sensor) {
                    if (!name.trim()) {
                      setName(sensor.name);
                    }
                    if (!locationName.trim() && sensor.location_name) {
                      setLocationName(sensor.location_name);
                    }
                    if (
                      !stationAssignment.trim() &&
                      sensor.station_assignment
                    ) {
                      setStationAssignment(sensor.station_assignment);
                    }
                  }
                }
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="">No sensor assigned</option>
              {sensors.map((sensor) => {
                const latestReading = getLatestReading(sensor.id);
                const isAssignedToOtherEquipment =
                  equipment?.sensor_id !== sensor.id &&
                  allEquipment.some((eq) => eq.sensor_id === sensor.id);
                return (
                  <option
                    key={sensor.id}
                    value={sensor.id}
                    disabled={isAssignedToOtherEquipment}
                  >
                    {sensor.name}
                    {sensor.location_name ? ` (${sensor.location_name})` : ""}
                    {latestReading?.temperature
                      ? ` - ${latestReading.temperature.toFixed(1)}°F`
                      : ""}
                    {!sensor.active ? " [Inactive]" : ""}
                    {isAssignedToOtherEquipment ? " [Already Assigned]" : ""}
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Select a SensorPush sensor to automatically monitor this
              equipment's temperature
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              rows={3}
              placeholder="Additional notes or specifications..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : equipment ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// SensorPush Integration Modal
const SensorPushSetupModal = ({ isOpen, onClose, onSetup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSetup(email, password);
      onClose();
    } catch (error) {
      console.error("Setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Setup SensorPush Integration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              SensorPush Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              SensorPush Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50"
            >
              {isLoading ? "Setting up..." : "Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const HACCPManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fridges");
  const [showSensorPushSetup, setShowSensorPushSetup] = useState(false);
  const [showEquipmentConfig, setShowEquipmentConfig] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [assigningSensorId, setAssigningSensorId] = useState(null);
  const [oldestReading, setOldestReading] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [showTemperatureDataModal, setShowTemperatureDataModal] =
    useState(false);
  const [selectedSensorForData, setSelectedSensorForData] = useState(null);
  const [reportsTimeRange, setReportsTimeRange] = useState(24);

  // SensorPush configuration state
  const [syncTimeHours, setSyncTimeHours] = useState(24);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60); // minutes
  const [dataRefreshRate, setDataRefreshRate] = useState(10); // minutes - default to 10 minutes for food safety
  const [lastManualSync, setLastManualSync] = useState<string | null>(null);
  const { organization } = useAuth();

  // Get user's timezone from organization settings, default to 'America/Toronto'
  const userTimezone =
    organization?.settings?.default_timezone || "America/Toronto";
  const timeFormat = organization?.settings?.time_format || "12h";

  // Centralized time formatting function for the entire page
  const formatTimeWithTimezone = (timeString) => {
    if (
      !timeString ||
      timeString === "Never" ||
      timeString === "No sensor data"
    ) {
      return timeString;
    }

    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Return original if invalid date
      }

      const options = {
        timeZone: userTimezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: timeFormat === "12h",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
        timeZoneName: "short", // This adds the timezone abbreviation like EST, PST, etc.
      };

      return date.toLocaleString("en-US", options);
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString; // Return original on error
    }
  };
  const {
    integration,
    sensors,
    readings,
    temperatureLogs,
    isLoading,
    isSyncing,
    createIntegration,
    syncSensors,
    syncReadings,
    addTemperatureLog,
    updateSensorAssignment,
    loadReadings,
    loadTemperatureLogs,
    getLatestReading,
    getTemperatureStatus,
  } = useSensorPush();

  // Debug logging
  console.log(`[HACCPManager] Component state:`, {
    activeTab,
    hasIntegration: !!integration,
    sensorsCount: sensors.length,
    readingsCount: readings.length,
    isLoading,
    isSyncing,
  });

  const handleOrganizationChange = (updatedOrg: any) => {
    // Handle organization updates here if needed
    console.log("Organization updated:", updatedOrg);
  };

  const handleSensorPushSetup = async (email: string, password: string) => {
    await createIntegration(email, password);
  };

  // Load equipment from database
  const loadEquipment = async () => {
    if (!organization?.id) return;

    try {
      setIsLoadingEquipment(true);
      const { data, error } = await supabase
        .from("haccp_equipment")
        .select("*")
        .eq("organization_id", organization.id)
        .eq("is_active", true)
        .order("equipment_type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
      toast.error("Failed to load equipment");
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  // Save equipment (create or update)
  const handleSaveEquipment = async (equipmentData) => {
    if (!organization?.id) return;

    try {
      const payload = {
        ...equipmentData,
        organization_id: organization.id,
        updated_at: new Date().toISOString(),
      };

      if (equipmentData.id) {
        // Update existing
        const { error } = await supabase
          .from("haccp_equipment")
          .update(payload)
          .eq("id", equipmentData.id)
          .eq("organization_id", organization.id);

        if (error) throw error;
        toast.success("Equipment updated successfully");
      } else {
        // Create new
        const { error } = await supabase
          .from("haccp_equipment")
          .insert(payload);

        if (error) throw error;
        toast.success("Equipment added successfully");
      }

      await loadEquipment();
      setEditingEquipment(null);
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("Failed to save equipment");
      throw error;
    }
  };

  // Delete equipment
  const handleDeleteEquipment = async (equipmentId) => {
    if (!organization?.id) return;

    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const { error } = await supabase
        .from("haccp_equipment")
        .update({ is_active: false })
        .eq("id", equipmentId)
        .eq("organization_id", organization.id);

      if (error) throw error;
      toast.success("Equipment deleted successfully");
      await loadEquipment();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment");
    }
  };

  // Load oldest reading from database
  const loadOldestReading = async () => {
    if (!organization?.id) return;

    try {
      const { data, error } = await supabase
        .from("sensorpush_readings")
        .select("observed_at")
        .eq("organization_id", organization.id)
        .order("observed_at", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading oldest reading:", error);
        return;
      }

      if (data) {
        setOldestReading(data.observed_at);
      }
    } catch (error) {
      console.error("Error loading oldest reading:", error);
    }
  };

  // Load equipment on mount and organization change
  React.useEffect(() => {
    if (organization?.id) {
      loadEquipment();
      loadOldestReading();
    }
  }, [organization?.id]);

  const handleAssignSensorLocation = async (sensorId: string) => {
    const sensor = sensors.find((s) => s.id === sensorId);
    if (!sensor) return;

    // Create a new equipment entry pre-populated with sensor data
    const newEquipment = {
      name: sensor.name,
      equipment_type: "fridge", // Default type
      location_name: sensor.location_name || "",
      station_assignment: sensor.station_assignment || "",
      notes: "",
      sensor_id: sensorId,
    };

    setAssigningSensorId(sensorId);
    setEditingEquipment(newEquipment);
    setShowEquipmentConfig(true);
  };

  const handleViewTemperatureData = (sensorId: string) => {
    const sensor = sensors.find((s) => s.id === sensorId);
    if (!sensor) return;

    setSelectedSensorForData(sensor);
    setShowTemperatureDataModal(true);
  };

  // Get equipment cards for the specified type
  const getEquipmentCards = (equipmentType: string) => {
    const filteredEquipment = equipment.filter(
      (eq) => eq.equipment_type === equipmentType,
    );

    return filteredEquipment.map((eq) => {
      // Try to find a sensor reading for this equipment using sensor_id first, then fallback to location matching
      const assignedSensor = eq.sensor_id
        ? sensors.find((s) => s.id === eq.sensor_id)
        : sensors.find((s) => s.location_name === eq.name);

      const latestReading = assignedSensor
        ? getLatestReading(assignedSensor.id)
        : null;

      const temperature = latestReading?.temperature;
      const status = temperature
        ? getTemperatureStatus(temperature, equipmentType.replace("-", "_"))
        : "normal";
      const timeAgo = latestReading
        ? latestReading.observed_at
        : "No sensor data";

      return (
        <TemperatureCard
          key={eq.id}
          title={eq.name}
          temp={temperature ? temperature.toFixed(1) : "--"}
          status={status}
          time={timeAgo}
          location={eq.location_name}
          isConnected={!!assignedSensor && assignedSensor.active}
          batteryLevel={assignedSensor?.battery_voltage}
          sensorId={assignedSensor?.id}
          onAssignLocation={handleAssignSensorLocation}
          onEdit={() => {
            setEditingEquipment(eq);
            setShowEquipmentConfig(true);
          }}
          onRefresh={() => {
            // Refresh sensor data for this equipment
            if (assignedSensor) {
              console.log("Refreshing data for sensor:", assignedSensor.id);
              handleManualRefresh();
            }
          }}
          onDelete={() => handleDeleteEquipment(eq.id)}
          onViewData={
            assignedSensor
              ? () => handleViewTemperatureData(assignedSensor.id)
              : undefined
          }
        />
      );
    });
  };

  // Convert sensor readings to temperature cards (fallback for sensors without equipment)
  const getSensorTemperatureCards = (equipmentType: string) => {
    console.log(
      `[HACCPManager] Getting temperature cards for equipment type: ${equipmentType}`,
    );
    console.log(
      `[HACCPManager] Available sensors:`,
      sensors.map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location_name,
        active: s.active,
      })),
    );
    console.log(`[HACCPManager] Available readings:`, readings.length);

    // Debug: Log sample readings
    if (readings.length > 0) {
      console.log(
        `[HACCPManager] Sample readings:`,
        readings.slice(0, 3).map((r) => ({
          sensor_id: r.sensor_id,
          observed_at: r.observed_at,
          temperature: r.temperature,
        })),
      );

      // Log readings count per sensor
      const readingsBySensor = readings.reduce(
        (acc, reading) => {
          acc[reading.sensor_id] = (acc[reading.sensor_id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      console.log(`[HACCPManager] Readings by sensor:`, readingsBySensor);
    }

    // Filter out sensors that are already assigned to equipment to avoid duplicates
    const assignedSensorIds = equipment
      .map((eq) => eq.sensor_id)
      .filter(Boolean);
    const unassignedSensors = sensors.filter(
      (sensor) => !assignedSensorIds.includes(sensor.id),
    );

    // For debugging, let's show unassigned sensors only
    const shouldFilterByLocation = false; // Set to true to enable location filtering

    const filteredSensors = shouldFilterByLocation
      ? unassignedSensors.filter((sensor) => {
          // Filter sensors based on their location assignment
          const location = sensor.location_name?.toLowerCase() || "";
          let matches = false;

          switch (equipmentType) {
            case "fridges":
              matches =
                location.includes("fridge") ||
                location.includes("cooler") ||
                location.includes("refrigerat") ||
                location.includes("cold");
              break;
            case "freezers":
              matches = location.includes("freezer");
              break;
            case "hot-holding":
              matches =
                location.includes("hot") || location.includes("warming");
              break;
            default:
              matches = true;
          }

          console.log(
            `[HACCPManager] Sensor ${sensor.name} (${location}) matches ${equipmentType}: ${matches}`,
          );
          return matches;
        })
      : unassignedSensors; // Show unassigned sensors only

    console.log(
      `[HACCPManager] ${shouldFilterByLocation ? "Filtered" : "Showing unassigned"} ${filteredSensors.length} sensors for ${equipmentType}`,
    );

    return filteredSensors.map((sensor) => {
      const latestReading = getLatestReading(sensor.id);
      console.log(
        `[HACCPManager] Latest reading for sensor ${sensor.name} (${sensor.id}):`,
        latestReading
          ? {
              temperature: latestReading.temperature,
              observed_at: latestReading.observed_at,
              id: latestReading.id,
            }
          : "No reading found",
      );

      const temperature = latestReading?.temperature;
      const status = temperature
        ? getTemperatureStatus(temperature, equipmentType.replace("-", "_"))
        : "normal";
      const timeAgo = latestReading ? latestReading.observed_at : "Never";

      return (
        <TemperatureCard
          key={sensor.id}
          title={sensor.name}
          temp={temperature ? temperature.toFixed(1) : "--"}
          status={status}
          time={timeAgo}
          location={sensor.location_name || "Unassigned"}
          isConnected={sensor.active}
          batteryLevel={sensor.battery_voltage}
          sensorId={sensor.id}
          onAssignLocation={handleAssignSensorLocation}
          onEdit={() => {
            // For sensors, we'll open the assignment modal
            handleAssignSensorLocation(sensor.id);
          }}
          onRefresh={() => {
            console.log("Refreshing data for sensor:", sensor.id);
            handleManualRefresh();
          }}
          onDelete={() => {
            console.log("Removing sensor from view:", sensor.id);
            // Implement logic to hide sensor from view
          }}
          onViewData={() => handleViewTemperatureData(sensor.id)}
        />
      );
    });
  };

  // Enhanced sync readings with configurable time and refresh rate control
  const handleSyncReadings = async (customHours?: number) => {
    const hoursToSync = customHours || syncTimeHours;
    const startTime = new Date(
      Date.now() - hoursToSync * 60 * 60 * 1000,
    ).toISOString();

    try {
      await syncReadings(startTime);
      setLastManualSync(new Date().toISOString());
      toast.success(`Synced readings from last ${hoursToSync} hours`);
    } catch (error) {
      console.error("Error syncing readings:", error);
    }
  };

  // Manual refresh with rate limiting based on configured refresh rate
  const handleManualRefresh = async () => {
    // Check if enough time has passed since last refresh
    if (lastRefresh) {
      const timeSinceLastRefresh = Date.now() - new Date(lastRefresh).getTime();
      const minRefreshInterval = dataRefreshRate * 60 * 1000; // Convert minutes to milliseconds

      if (timeSinceLastRefresh < minRefreshInterval) {
        const remainingTime = Math.ceil(
          (minRefreshInterval - timeSinceLastRefresh) / 60000,
        );
        toast.error(
          `Please wait ${remainingTime} more minute(s) before refreshing again`,
        );
        return;
      }
    }

    try {
      // Sync recent data based on refresh rate (sync last 2x the refresh rate to ensure we don't miss data)
      const syncHours = Math.max(1, dataRefreshRate / 30); // At least 1 hour, or 2x refresh rate
      await handleSyncReadings(syncHours);
      setLastRefresh(new Date().toISOString());
      toast.success(`Data refreshed (${dataRefreshRate}min intervals)`);
    } catch (error) {
      console.error("Error during manual refresh:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Get available refresh rate options (prepare for tiered access)
  const getRefreshRateOptions = () => {
    // TODO: In the future, filter options based on user tier
    // For now, all options are available
    return [
      { value: 5, label: "5 minutes", tier: "premium" },
      { value: 10, label: "10 minutes", tier: "standard" },
      { value: 15, label: "15 minutes", tier: "standard" },
      { value: 30, label: "30 minutes", tier: "basic" },
      { value: 60, label: "1 hour", tier: "basic" },
    ];
  };

  // Check if user can access a specific refresh rate (prepare for tiered access)
  const canAccessRefreshRate = (tier: string) => {
    // TODO: Implement actual tier checking based on organization subscription
    // For now, all tiers are accessible
    return true;
  };

  // Quick sync presets
  const handleQuickSync = async (hours: number, label: string) => {
    try {
      await handleSyncReadings(hours);
      toast.success(`${label} sync completed`);
    } catch (error) {
      toast.error(`${label} sync failed`);
    }
  };

  // Enhanced audit export functionality
  const handleAuditExport = async (format: "xlsx" | "csv", hours: number) => {
    if (!organization?.id) {
      toast.error("Organization not found");
      return;
    }

    try {
      // First ensure we have the data for the requested time range
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const endTime = new Date();

      // Filter readings for the time range
      const filteredReadings = readings.filter((r) => {
        const readingTime = new Date(r.observed_at);
        return readingTime >= startTime && readingTime <= endTime;
      });

      if (filteredReadings.length === 0) {
        toast.error(
          `No data available for the selected time range. Try syncing data first.`,
        );
        return;
      }

      // Prepare comprehensive audit data
      const auditData = filteredReadings.map((reading) => {
        const sensor = sensors.find((s) => s.id === reading.sensor_id);
        const assignedEquipment = equipment.find(
          (e) => e.sensor_id === reading.sensor_id,
        );

        // Determine compliance status
        let complianceStatus = "Compliant";
        let temperatureLimit = "N/A";

        if (assignedEquipment) {
          switch (assignedEquipment.equipment_type) {
            case "fridge":
            case "cold_holding":
              temperatureLimit = "≤ 41°F";
              if (reading.temperature && reading.temperature > 41) {
                complianceStatus = "VIOLATION - Too Warm";
              }
              break;
            case "freezer":
              temperatureLimit = "≤ 0°F";
              if (reading.temperature && reading.temperature > 0) {
                complianceStatus = "VIOLATION - Too Warm";
              }
              break;
            case "hot_holding":
              temperatureLimit = "≥ 135°F";
              if (reading.temperature && reading.temperature < 135) {
                complianceStatus = "VIOLATION - Too Cold";
              }
              break;
          }
        }

        return {
          "Date/Time": formatTimeWithTimezone(reading.observed_at),
          "Equipment Name": assignedEquipment?.name || "Unassigned Equipment",
          "Equipment Type":
            assignedEquipment?.equipment_type
              ?.replace("_", " ")
              .toUpperCase() || "Unknown",
          Location:
            assignedEquipment?.location_name ||
            sensor?.location_name ||
            "Unknown Location",
          Station: assignedEquipment?.station_assignment || "N/A",
          "Temperature (°F)": reading.temperature?.toFixed(1) || "N/A",
          "Humidity (%)": reading.humidity?.toFixed(1) || "N/A",
          "Temperature Limit": temperatureLimit,
          "Compliance Status": complianceStatus,
          "Sensor Name": sensor?.name || "Unknown Sensor",
          "Sensor ID": reading.sensor_id,
          "Sensor Active": sensor?.active ? "Yes" : "No",
          "Battery Voltage": sensor?.battery_voltage?.toFixed(2) || "N/A",
          "Signal Strength (RSSI)": sensor?.rssi || "N/A",
          "Dewpoint (°F)": reading.dewpoint?.toFixed(1) || "N/A",
          "Barometric Pressure":
            reading.barometric_pressure?.toFixed(2) || "N/A",
          Organization: organization.name,
          "Report Generated": formatTimeWithTimezone(new Date().toISOString()),
          "Data Source": "SensorPush Wireless Sensors",
        };
      });

      // Sort by date/time (newest first)
      auditData.sort(
        (a, b) =>
          new Date(b["Date/Time"]).getTime() -
          new Date(a["Date/Time"]).getTime(),
      );

      // Generate filename
      const timeRangeLabel =
        hours === 24
          ? "24h"
          : hours === 168
            ? "7d"
            : hours === 720
              ? "30d"
              : hours === 1440
                ? "60d"
                : `${hours}h`;
      const filename = `HACCP_Temperature_Audit_${organization.name.replace(/[^a-zA-Z0-9]/g, "_")}_${timeRangeLabel}_${new Date().toISOString().split("T")[0]}`;

      if (format === "xlsx") {
        // Create Excel workbook with multiple sheets
        const workbook = {
          SheetNames: ["Temperature Data", "Summary", "Equipment List"],
          Sheets: {
            "Temperature Data": auditData,
            Summary: [
              {
                "Report Summary": "HACCP Temperature Monitoring Audit Report",
                Organization: organization.name,
                "Report Period": `${formatTimeWithTimezone(startTime.toISOString())} to ${formatTimeWithTimezone(endTime.toISOString())}`,
                "Total Readings": auditData.length,
                Violations: auditData.filter((d) =>
                  d["Compliance Status"].includes("VIOLATION"),
                ).length,
                "Compliance Rate": `${(((auditData.length - auditData.filter((d) => d["Compliance Status"].includes("VIOLATION")).length) / auditData.length) * 100).toFixed(2)}%`,
                "Active Sensors": sensors.filter((s) => s.active).length,
                "Total Equipment": equipment.length,
                "Report Generated By": "ChefLife HACCP Manager",
                "Generated On": formatTimeWithTimezone(
                  new Date().toISOString(),
                ),
              },
            ],
            "Equipment List": equipment.map((eq) => ({
              "Equipment Name": eq.name,
              Type: eq.equipment_type?.replace("_", " ").toUpperCase(),
              Location: eq.location_name,
              Station: eq.station_assignment || "N/A",
              "Assigned Sensor":
                sensors.find((s) => s.id === eq.sensor_id)?.name ||
                "No sensor assigned",
              "Sensor Status": sensors.find((s) => s.id === eq.sensor_id)
                ?.active
                ? "Active"
                : "Inactive",
              Notes: eq.notes || "N/A",
            })),
          },
        };

        // Convert to Excel and download
        const XLSX = await import("xlsx");
        const wb = XLSX.utils.book_new();

        // Add Temperature Data sheet
        const ws1 = XLSX.utils.json_to_sheet(auditData);
        XLSX.utils.book_append_sheet(wb, ws1, "Temperature Data");

        // Add Summary sheet
        const ws2 = XLSX.utils.json_to_sheet(workbook.Sheets["Summary"]);
        XLSX.utils.book_append_sheet(wb, ws2, "Summary");

        // Add Equipment List sheet
        const ws3 = XLSX.utils.json_to_sheet(workbook.Sheets["Equipment List"]);
        XLSX.utils.book_append_sheet(wb, ws3, "Equipment List");

        XLSX.writeFile(wb, `${filename}.xlsx`);
      } else {
        // CSV format
        const csvContent = convertToCSV(auditData);
        downloadFile(csvContent, `${filename}.csv`, "text/csv");
      }

      toast.success(
        `Audit report exported successfully (${auditData.length} readings)`,
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export audit report");
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (!data.length) return "";

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(","),
      ),
    ].join("\n");

    return csvContent;
  };

  // Helper function to download file
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle time range change from ReportsAnalytics
  const handleReportsTimeRangeChange = async (timeRange: number) => {
    console.log(`[HACCPManager] Loading data for ${timeRange} hours`);
    setReportsTimeRange(timeRange);
    try {
      // Load readings for the selected time range
      await loadReadings(undefined, timeRange);
      // Load temperature logs for the selected time range
      await loadTemperatureLogs(undefined, timeRange);
      console.log(`[HACCPManager] Data loaded for ${timeRange} hours`);
    } catch (error) {
      console.error("Error loading data for time range:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/HACCPManager/index.tsx
      </div>
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="h-6 w-6 text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-white">HACCP Manager</h1>
          </div>
          <p className="text-gray-400">
            Track and monitor food safety compliance with automated sensors
          </p>
          {integration && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1 text-green-500">
                <Wifi className="h-4 w-4" />
                <span>SensorPush Connected</span>
              </div>
              <div className="text-gray-400">
                {sensors.length} sensors •{" "}
                {sensors.filter((s) => !s.location_name).length} unassigned •
                Refresh rate: {dataRefreshRate}min • Last sync:{" "}
                {(() => {
                  // Get the most recent timestamp from various sources
                  const timestamps = [
                    integration.last_sync_at,
                    lastRefresh,
                    lastManualSync,
                    readings.length > 0 ? readings[0].observed_at : null,
                  ].filter(Boolean);

                  if (timestamps.length === 0) return "Never";

                  // Find the most recent timestamp
                  const mostRecent = timestamps.reduce((latest, current) => {
                    return new Date(current) > new Date(latest)
                      ? current
                      : latest;
                  });

                  return formatTimeWithTimezone(mostRecent);
                })()}
              </div>
              {sensors.filter((s) => !s.location_name).length > 0 && (
                <div className="text-amber-400 text-xs">
                  ⚠️ {sensors.filter((s) => !s.location_name).length} sensors
                  need location assignment
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {integration ? (
            <>
              <button
                onClick={handleManualRefresh}
                disabled={isSyncing}
                className="btn-ghost"
                title={`Refresh data (${dataRefreshRate}min intervals)`}
              >
                <RefreshCw
                  className={`w-5 h-5 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                />
                Refresh Data
              </button>
              <button
                onClick={() => syncSensors()}
                disabled={isSyncing}
                className="btn-ghost"
              >
                <Settings className="w-5 h-5 mr-2" />
                Sync Sensors
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSensorPushSetup(true)}
              className="btn-ghost"
            >
              <Wifi className="w-5 h-5 mr-2" />
              Setup SensorPush
            </button>
          )}
          <button
            onClick={() => {
              setEditingEquipment(null);
              setShowEquipmentConfig(true);
            }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Equipment
          </button>
        </div>
      </header>
      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("fridges")}
          className={`tab primary ${activeTab === "fridges" ? "active" : ""}`}
        >
          <Thermometer className="w-5 h-5" />
          Fridges
        </button>
        <button
          onClick={() => setActiveTab("freezers")}
          className={`tab green ${activeTab === "freezers" ? "active" : ""}`}
        >
          <ThermometerSnowflake className="w-5 h-5" />
          Freezers
        </button>
        <button
          onClick={() => setActiveTab("hot-holding")}
          className={`tab amber ${activeTab === "hot-holding" ? "active" : ""}`}
        >
          <ThermometerSun className="w-5 h-5" />
          Hot Holding
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`tab rose ${activeTab === "reports" ? "active" : ""}`}
        >
          <BarChart3 className="w-5 h-5" />
          Reports & Analytics
        </button>
        <button
          onClick={() => setActiveTab("diagrams")}
          className={`tab purple ${activeTab === "diagrams" ? "active" : ""}`}
        >
          <ClipboardCheck className="w-5 h-5" />
          Fridge Organization
        </button>

        <button
          onClick={() => setActiveTab("health")}
          className={`tab lime ${activeTab === "health" ? "active" : ""}`}
        >
          <FileCheck className="w-5 h-5" />
          Board of Health
        </button>
        <button
          onClick={() => setActiveTab("sensorpush-config")}
          className={`tab red ${activeTab === "sensorpush-config" ? "active" : ""}`}
        >
          <img
            src="https://support.sensorpush.com/hc/article_attachments/360081534054/logo-with-r-small.png"
            alt="SensorPush"
            className="w-5 h-5 object-contain"
          />
          SensorPush Config
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "fridges" && (
        <TemperatureLog
          title="Fridge Temperature Logs"
          description="Track and monitor fridge temperatures to ensure food safety compliance."
          icon={Thermometer}
          getEquipmentCards={getEquipmentCards}
          getSensorTemperatureCards={getSensorTemperatureCards}
          sensors={sensors}
          equipmentType="fridge"
          integration={integration}
          readings={readings}
          equipment={equipment}
          onAddEquipment={() => {
            setEditingEquipment(null);
            setShowEquipmentConfig(true);
          }}
        />
      )}
      {activeTab === "freezers" && (
        <TemperatureLog
          title="Freezer Temperature Logs"
          description="Track and monitor freezer temperatures to ensure food safety compliance."
          icon={ThermometerSnowflake}
          getEquipmentCards={getEquipmentCards}
          getSensorTemperatureCards={getSensorTemperatureCards}
          sensors={sensors}
          equipmentType="freezer"
          integration={integration}
          readings={readings}
          equipment={equipment}
          onAddEquipment={() => {
            setEditingEquipment(null);
            setShowEquipmentConfig(true);
          }}
        />
      )}
      {activeTab === "hot-holding" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <ThermometerSun className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Hot Holding Line Checks
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost">
                <Download className="h-5 w-5 mr-2" />
              </button>
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </button>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Monitor hot holding temperatures to maintain food safety standards.
          </p>

          <EmptyState
            title="No Hot Holding Records Yet"
            description="Start tracking hot holding temperatures to ensure food safety compliance. Hot foods must be kept at 135°F (57°C) or above."
            icon={Thermometer}
          />
        </div>
      )}
      {activeTab === "sensorpush-config" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    SensorPush Configuration
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Manage your wireless temperature sensors and data sync
                    settings
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {integration ? (
                  <>
                    <button
                      onClick={handleManualRefresh}
                      disabled={isSyncing}
                      className="btn-ghost"
                      title={`Get latest data (every ${dataRefreshRate} minutes)`}
                    >
                      <RefreshCw
                        className={`w-5 h-5 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                      />
                      Get Latest Data
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowSensorPushSetup(true)}
                    className="btn-primary"
                  >
                    <Wifi className="w-5 h-5 mr-2" />
                    Connect SensorPush
                  </button>
                )}
              </div>
            </div>
          </div>

          {integration ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* 1. Connection Status & Data Sync - Combined Dynamic Card */}
              <Card className="border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Wifi className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-white">
                          Connection & Data Sync
                        </CardTitle>
                        <p className="text-sm text-gray-400 mt-1">
                          Your SensorPush account is connected and syncing data
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-green-500 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Connected
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {sensors.length}
                      </div>
                      <div className="text-sm text-gray-400">Sensors Found</div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {sensors.filter((s) => s.location_name).length}
                      </div>
                      <div className="text-sm text-gray-400">
                        Assigned to Equipment
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {
                          readings.filter(
                            (r) =>
                              new Date(r.observed_at) >=
                              new Date(Date.now() - 24 * 60 * 60 * 1000),
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-400">
                        Readings Today
                      </div>
                    </div>
                  </div>

                  {/* Data Refresh Controls & System Information - Responsive Layout */}
                  <div className="border-t border-gray-700 pt-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* Data Refresh Controls */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">
                                Data Refresh Controls
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">
                                Get the latest temperature data from your
                                sensors
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400">
                            Rate limit: {dataRefreshRate}min
                          </div>
                        </div>

                        {/* Refresh Rate Setting */}
                        <div className="mb-4">
                          <label className="block font-medium text-white mb-2">
                            Data Refresh Rate Limit
                          </label>
                          <select
                            value={dataRefreshRate}
                            onChange={(e) =>
                              setDataRefreshRate(parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                          >
                            {getRefreshRateOptions().map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                                disabled={!canAccessRefreshRate(option.tier)}
                              >
                                Every {option.label}
                                {!canAccessRefreshRate(option.tier)
                                  ? " (Premium)"
                                  : ""}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-400 mt-2">
                            💡 Faster refresh rates give you more up-to-date
                            temperatures for critical food safety monitoring
                          </p>
                        </div>

                        {/* Primary Refresh Button */}
                        <div className="mb-4">
                          <button
                            onClick={handleManualRefresh}
                            disabled={isSyncing}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                          >
                            <RefreshCw
                              className={`w-5 h-5 ${isSyncing ? "animate-spin" : ""}`}
                            />
                            {isSyncing
                              ? "Syncing Latest Data..."
                              : "Get Latest Data"}
                          </button>
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            Last refreshed:{" "}
                            {lastRefresh
                              ? formatTimeWithTimezone(lastRefresh)
                              : "Never"}
                          </p>
                        </div>

                        {/* Quick Sync Options */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-white mb-3">
                            Quick Historical Sync
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2">
                            <button
                              onClick={() => handleQuickSync(1, "Last Hour")}
                              disabled={isSyncing}
                              className="btn-ghost text-sm py-2 flex flex-col items-center gap-1"
                            >
                              <Clock
                                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                              />
                              <span>1 Hour</span>
                            </button>
                            <button
                              onClick={() => handleQuickSync(24, "Last Day")}
                              disabled={isSyncing}
                              className="btn-ghost text-sm py-2 flex flex-col items-center gap-1"
                            >
                              <Clock
                                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                              />
                              <span>1 Day</span>
                            </button>
                            <button
                              onClick={() => handleQuickSync(168, "Last Week")}
                              disabled={isSyncing}
                              className="btn-ghost text-sm py-2 flex flex-col items-center gap-1"
                            >
                              <Clock
                                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                              />
                              <span>1 Week</span>
                            </button>
                            <button
                              onClick={() => handleQuickSync(720, "Last Month")}
                              disabled={isSyncing}
                              className="btn-ghost text-sm py-2 flex flex-col items-center gap-1"
                            >
                              <Clock
                                className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`}
                              />
                              <span>1 Month</span>
                            </button>
                          </div>
                        </div>

                        {/* Custom Range */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-white mb-2">
                            Custom Range
                          </h5>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="1440"
                              value={syncTimeHours}
                              onChange={(e) =>
                                setSyncTimeHours(parseInt(e.target.value) || 24)
                              }
                              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                            />
                            <span className="text-gray-400 text-sm">hours</span>
                            <button
                              onClick={() => handleSyncReadings()}
                              disabled={isSyncing}
                              className="btn-ghost text-sm px-3 py-1"
                            >
                              Sync
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* System Information */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gray-500/20 rounded-lg flex items-center justify-center">
                            <Settings className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              System Information
                            </h4>
                            <p className="text-sm text-gray-400 mt-1">
                              Technical details and connection status
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                          <div className="flex justify-between">
                            <span>API Connection:</span>
                            <span className="text-green-400">Connected</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Account:</span>
                            <span className="text-white">
                              {integration.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Sensors:</span>
                            <span className="text-white">
                              {sensors.filter((s) => s.active).length} /{" "}
                              {sensors.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Refresh Rate:</span>
                            <span className="text-white">
                              {dataRefreshRate} minutes
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Readings:</span>
                            <span className="text-white">
                              {readings.length.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Historical Sync:</span>
                            <span className="text-white">
                              {lastManualSync
                                ? formatTimeWithTimezone(lastManualSync)
                                : "Never"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Historical Sync Range:</span>
                            <span className="text-white">
                              {syncTimeHours} hours
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Auto Sync:</span>
                            <span className="text-gray-400">Coming Soon</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Sensor Assignment - What Needs Attention */}
              <Card className="border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-white">
                          Sensor Assignment
                          {sensors.filter((s) => !s.location_name).length >
                            0 && (
                            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-full">
                              {sensors.filter((s) => !s.location_name).length}{" "}
                              need assignment
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-400 mt-1">
                          Assign sensors to specific equipment for temperature
                          monitoring
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => syncSensors()}
                      disabled={isSyncing}
                      className="btn-ghost text-sm"
                      title="Check for new sensors"
                    >
                      <Settings
                        className={`w-4 h-4 mr-1 ${isSyncing ? "animate-spin" : ""}`}
                      />
                      Find Sensors
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {sensors.length > 0 ? (
                    <div className="space-y-3">
                      {sensors.map((sensor) => {
                        const latestReading = getLatestReading(sensor.id);
                        const isUnassigned = !sensor.location_name;

                        return (
                          <div
                            key={sensor.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${
                              isUnassigned
                                ? "border-amber-500/30 bg-amber-500/5"
                                : "border-gray-600 bg-gray-700/30"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {sensor.active ? (
                                  <div
                                    className="w-2 h-2 bg-green-500 rounded-full"
                                    title="Online"
                                  />
                                ) : (
                                  <div
                                    className="w-2 h-2 bg-red-500 rounded-full"
                                    title="Offline"
                                  />
                                )}
                                <span className="font-medium text-white">
                                  {sensor.name}
                                </span>
                              </div>
                              <div className="text-sm text-gray-400">
                                {latestReading?.temperature
                                  ? `${latestReading.temperature.toFixed(1)}°F`
                                  : "No recent data"}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-sm text-right">
                                <div
                                  className={
                                    isUnassigned
                                      ? "text-amber-400 font-medium"
                                      : "text-gray-300"
                                  }
                                >
                                  {sensor.location_name ||
                                    "Not assigned to equipment"}
                                </div>
                                {sensor.station_assignment && (
                                  <div className="text-gray-500 text-xs">
                                    Station: {sensor.station_assignment}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() =>
                                  handleAssignSensorLocation(sensor.id)
                                }
                                className={`text-sm px-3 py-2 rounded ${
                                  isUnassigned
                                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                                    : "bg-gray-600 hover:bg-gray-500 text-gray-200"
                                }`}
                              >
                                {isUnassigned
                                  ? "Assign to Equipment"
                                  : "Change Assignment"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Thermometer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium mb-2">No sensors found</p>
                      <p className="text-sm">
                        Click "Find Sensors" to search for your SensorPush
                        devices
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Historical Data & Audit Reports - Getting Past Information */}
              <Card className="border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">
                        Historical Data & Audit Reports
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        Download comprehensive temperature data for food safety
                        audits, health inspections, and compliance reporting
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Audit Report Downloads */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                        <Download className="h-5 w-5 text-green-500" />
                      </div>
                      <h4 className="font-semibold text-white">
                        Audit Report Downloads
                      </h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Generate comprehensive reports for health inspections,
                      corporate audits, and compliance documentation. Available
                      in Excel (.xlsx) and CSV formats.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Excel Reports */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-green-400" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-white">
                              Excel Reports (.xlsx)
                            </h5>
                            <p className="text-xs text-gray-400">
                              Professional formatted reports with charts
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAuditExport("xlsx", 24)}
                            disabled={isSyncing}
                            className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 24 Hours
                          </button>
                          <button
                            onClick={() => handleAuditExport("xlsx", 168)}
                            disabled={isSyncing}
                            className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 7 Days
                          </button>
                          <button
                            onClick={() => handleAuditExport("xlsx", 720)}
                            disabled={isSyncing}
                            className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 30 Days
                          </button>
                          <button
                            onClick={() => handleAuditExport("xlsx", 1440)}
                            disabled={isSyncing}
                            className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 60 Days (Audit Ready)
                          </button>
                        </div>
                      </div>

                      {/* CSV Reports */}
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-white">
                              CSV Reports (.csv)
                            </h5>
                            <p className="text-xs text-gray-400">
                              Raw data for analysis and integration
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAuditExport("csv", 24)}
                            disabled={isSyncing}
                            className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 24 Hours
                          </button>
                          <button
                            onClick={() => handleAuditExport("csv", 168)}
                            disabled={isSyncing}
                            className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 7 Days
                          </button>
                          <button
                            onClick={() => handleAuditExport("csv", 720)}
                            disabled={isSyncing}
                            className="w-full btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 30 Days
                          </button>
                          <button
                            onClick={() => handleAuditExport("csv", 1440)}
                            disabled={isSyncing}
                            className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            Last 60 Days (Audit Ready)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-amber-400 font-medium mb-1">
                            Audit Report Features:
                          </p>
                          <ul className="text-gray-300 space-y-1 text-xs">
                            <li>
                              • Complete temperature history with timestamps
                            </li>
                            <li>• Equipment assignments and locations</li>
                            <li>• Compliance status and violation tracking</li>
                            <li>
                              • Sensor battery levels and connectivity status
                            </li>
                            <li>
                              • Formatted for health department requirements
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Data Range Information */}
                  <div className="border-t border-gray-700 pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Data Range Information
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Overview of temperature data stored in the database
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Readings:</span>
                          <span className="text-white">
                            {readings.length.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Data Span:</span>
                          <span className="text-white">
                            {readings.length > 0 && oldestReading
                              ? (() => {
                                  const newestReading = readings[0];
                                  const daysDiff = Math.ceil(
                                    (new Date(
                                      newestReading.observed_at,
                                    ).getTime() -
                                      new Date(oldestReading).getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  );
                                  return `${daysDiff} days`;
                                })()
                              : "No data"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Oldest Reading:</span>
                          <span className="text-white">
                            {oldestReading
                              ? formatTimeWithTimezone(oldestReading)
                              : "No data"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Newest Reading:</span>
                          <span className="text-white">
                            {readings.length > 0
                              ? formatTimeWithTimezone(readings[0].observed_at)
                              : "No data"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Advanced Settings - For Power Users */}
              <Card className="xl:col-span-2 border border-gray-700/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">
                        Advanced Settings
                      </CardTitle>
                      <p className="text-sm text-gray-400 mt-1">
                        Technical settings and troubleshooting tools
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sensor Discovery */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">
                          Sensor Discovery
                        </h4>
                        <p className="text-sm text-gray-400">
                          Find new sensors or refresh sensor information
                        </p>
                      </div>
                      <button
                        onClick={() => syncSensors()}
                        disabled={isSyncing}
                        className="btn-ghost"
                      >
                        <Settings
                          className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
                        />
                        Find Sensors
                      </button>
                    </div>
                  </div>

                  {/* Future Features */}
                  <div className="opacity-50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">
                          Automatic Sync
                        </h4>
                        <p className="text-sm text-gray-400">
                          Automatically get new data in the background
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled={true}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-400">
                      🚧 Coming soon - automatic background sync will keep your
                      data up-to-date without manual refreshing
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border border-gray-700/50">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="h-8 w-8 text-primary-500" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    Connect Your SensorPush Account
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Link your SensorPush wireless sensors to automatically
                    monitor temperatures and ensure food safety compliance. No
                    more manual temperature logs!
                  </p>
                  <button
                    onClick={() => setShowSensorPushSetup(true)}
                    className="btn-primary"
                  >
                    <Wifi className="w-5 h-5 mr-2" />
                    Connect SensorPush Account
                  </button>
                  <div className="mt-6 text-sm text-gray-500">
                    <p>✓ Automatic temperature monitoring</p>
                    <p>✓ Real-time alerts for temperature violations</p>
                    <p>✓ Compliance reporting and data export</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {activeTab === "diagrams" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Fridge Organization Diagrams
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Diagram
              </button>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Create and manage visual diagrams for fridge organization.
          </p>

          <EmptyState
            title="No Organization Diagrams Yet"
            description="Create visual diagrams to standardize fridge organization and improve food safety by ensuring proper storage practices."
            icon={ClipboardCheck}
          />
        </div>
      )}
      {activeTab === "reports" && (
        <ReportsAnalytics
          sensors={sensors}
          readings={readings}
          equipment={equipment}
          temperatureLogs={temperatureLogs}
          formatTimeWithTimezone={formatTimeWithTimezone}
          onTimeRangeChange={handleReportsTimeRangeChange}
        />
      )}
      {activeTab === "health" && (
        <BoardOfHealth
          organization={organization}
          onChange={handleOrganizationChange}
        />
      )}
      {/* Equipment Configuration Modal */}
      <EquipmentConfigModal
        isOpen={showEquipmentConfig}
        onClose={() => {
          setShowEquipmentConfig(false);
          setEditingEquipment(null);
          setAssigningSensorId(null);
        }}
        onSave={async (equipmentData) => {
          if (assigningSensorId) {
            // If we're assigning a sensor, save the equipment and update sensor assignment
            await handleSaveEquipment(equipmentData);
            if (
              equipmentData.location_name &&
              equipmentData.station_assignment !== undefined
            ) {
              await updateSensorAssignment(
                assigningSensorId,
                equipmentData.location_name,
                equipmentData.station_assignment || undefined,
              );
            }
            setAssigningSensorId(null);
          } else {
            // Normal equipment save
            await handleSaveEquipment(equipmentData);
          }
        }}
        equipment={editingEquipment}
        allEquipment={equipment}
        sensors={sensors}
        getLatestReading={getLatestReading}
      />
      {/* SensorPush Setup Modal */}
      <SensorPushSetupModal
        isOpen={showSensorPushSetup}
        onClose={() => setShowSensorPushSetup(false)}
        onSetup={handleSensorPushSetup}
      />
      {/* Temperature Data Modal */}
      <TemperatureDataModal
        isOpen={showTemperatureDataModal}
        onClose={() => {
          setShowTemperatureDataModal(false);
          setSelectedSensorForData(null);
        }}
        sensor={selectedSensorForData}
        readings={readings}
        formatTimeWithTimezone={formatTimeWithTimezone}
      />
    </div>
  );
};

export default HACCPManager;
