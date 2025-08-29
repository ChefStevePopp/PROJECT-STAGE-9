import React from "react";
import {
  BarChart3,
  Download,
  Calendar as CalendarIcon,
  Wifi,
  Thermometer,
  Activity,
  FileText,
  LineChart,
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
  PieChart,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemperatureChart } from "./TemperatureChart";
import { useSensorPush } from "@/hooks/useSensorPush";

// Compliance Report Component
const ComplianceReport = ({
  readings,
  sensors,
  equipment,
  temperatureLogs,
  timeRange = 24,
}) => {
  const complianceData = React.useMemo(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() - timeRange * 60 * 60 * 1000);

    const recentReadings = readings.filter(
      (r) => new Date(r.observed_at) >= startTime,
    );
    const recentLogs = temperatureLogs.filter(
      (l) => new Date(l.recorded_at) >= startTime,
    );

    // Calculate compliance by equipment type
    const equipmentCompliance = equipment.map((eq) => {
      const assignedSensor = sensors.find((s) => s.id === eq.sensor_id);
      const sensorReadings = assignedSensor
        ? recentReadings.filter((r) => r.sensor_id === assignedSensor.id)
        : [];

      const violations = sensorReadings.filter((reading) => {
        if (!reading.temperature) return false;

        switch (eq.equipment_type) {
          case "fridge":
          case "cold_holding":
            return reading.temperature > 41;
          case "freezer":
            return reading.temperature > 0;
          case "hot_holding":
            return reading.temperature < 135;
          default:
            return false;
        }
      });

      const complianceRate =
        sensorReadings.length > 0
          ? ((sensorReadings.length - violations.length) /
              sensorReadings.length) *
            100
          : 100;

      return {
        equipment: eq,
        totalReadings: sensorReadings.length,
        violations: violations.length,
        complianceRate,
        lastReading: sensorReadings[0] || null,
      };
    });

    const overallCompliance =
      equipmentCompliance.length > 0
        ? equipmentCompliance.reduce((sum, eq) => sum + eq.complianceRate, 0) /
          equipmentCompliance.length
        : 100;

    return {
      equipmentCompliance,
      overallCompliance,
      totalReadings: recentReadings.length,
      totalViolations: equipmentCompliance.reduce(
        (sum, eq) => sum + eq.violations,
        0,
      ),
      manualLogs: recentLogs.length,
    };
  }, [readings, sensors, equipment, temperatureLogs, timeRange]);

  return (
    <div className="space-y-6">
      {/* Overall Compliance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Overall Compliance</p>
                <p className="text-2xl font-bold text-white">
                  {complianceData.overallCompliance.toFixed(1)}%
                </p>
              </div>
              <CheckCircle
                className={`h-8 w-8 ${
                  complianceData.overallCompliance >= 95
                    ? "text-green-500"
                    : complianceData.overallCompliance >= 85
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Readings</p>
                <p className="text-2xl font-bold text-white">
                  {complianceData.totalReadings.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Violations</p>
                <p className="text-2xl font-bold text-white">
                  {complianceData.totalViolations}
                </p>
              </div>
              <AlertTriangle
                className={`h-8 w-8 ${
                  complianceData.totalViolations === 0
                    ? "text-green-500"
                    : complianceData.totalViolations < 10
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Manual Logs</p>
                <p className="text-2xl font-bold text-white">
                  {complianceData.manualLogs}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Compliance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Equipment Compliance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceData.equipmentCompliance.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      item.complianceRate >= 95
                        ? "bg-green-500"
                        : item.complianceRate >= 85
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-white">
                      {item.equipment.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {item.equipment.equipment_type.replace("_", " ")} •{" "}
                      {item.equipment.location_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">
                    {item.complianceRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-400">
                    {item.violations} violations / {item.totalReadings} readings
                  </p>
                </div>
              </div>
            ))}

            {complianceData.equipmentCompliance.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No equipment configured for compliance monitoring</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Data Export Component
const DataExport = ({
  readings,
  sensors,
  equipment,
  temperatureLogs,
  formatTimeWithTimezone,
}) => {
  const [exportType, setExportType] = React.useState("readings");
  const [timeRange, setTimeRange] = React.useState(24);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - timeRange * 60 * 60 * 1000);

      let data = [];
      let filename = "";

      switch (exportType) {
        case "readings":
          data = readings
            .filter((r) => new Date(r.observed_at) >= startTime)
            .map((r) => {
              const sensor = sensors.find((s) => s.id === r.sensor_id);
              return {
                "Sensor Name": sensor?.name || "Unknown",
                Location: sensor?.location_name || "Unassigned",
                "Temperature (°F)": r.temperature,
                "Humidity (%)": r.humidity,
                "Observed At": formatTimeWithTimezone(r.observed_at),
                "Equipment Type":
                  equipment.find((e) => e.sensor_id === r.sensor_id)
                    ?.equipment_type || "Unassigned",
              };
            });
          filename = `temperature-readings-${timeRange}h`;
          break;

        case "compliance":
          data = equipment.map((eq) => {
            const assignedSensor = sensors.find((s) => s.id === eq.sensor_id);
            const sensorReadings = assignedSensor
              ? readings.filter(
                  (r) =>
                    r.sensor_id === assignedSensor.id &&
                    new Date(r.observed_at) >= startTime,
                )
              : [];

            const violations = sensorReadings.filter((reading) => {
              if (!reading.temperature) return false;
              switch (eq.equipment_type) {
                case "fridge":
                case "cold_holding":
                  return reading.temperature > 41;
                case "freezer":
                  return reading.temperature > 0;
                case "hot_holding":
                  return reading.temperature < 135;
                default:
                  return false;
              }
            });

            return {
              "Equipment Name": eq.name,
              "Equipment Type": eq.equipment_type,
              Location: eq.location_name,
              "Total Readings": sensorReadings.length,
              Violations: violations.length,
              "Compliance Rate (%)":
                sensorReadings.length > 0
                  ? (
                      ((sensorReadings.length - violations.length) /
                        sensorReadings.length) *
                      100
                    ).toFixed(2)
                  : "100.00",
              "Sensor Name": assignedSensor?.name || "No sensor assigned",
            };
          });
          filename = `compliance-report-${timeRange}h`;
          break;

        case "manual":
          data = temperatureLogs
            .filter((l) => new Date(l.recorded_at) >= startTime)
            .map((l) => ({
              Location: l.location_name,
              Station: l.station || "N/A",
              "Equipment Type": l.equipment_type,
              "Temperature (°F)": l.temperature,
              Status: l.status,
              "Recorded At": formatTimeWithTimezone(l.recorded_at),
              "Recorded By": l.recorded_by || "System",
              Notes: l.notes || "",
              "Corrective Action": l.corrective_action || "",
            }));
          filename = `manual-temperature-logs-${timeRange}h`;
          break;
      }

      if (format === "csv") {
        const csv = convertToCSV(data);
        downloadFile(csv, `${filename}.csv`, "text/csv");
      } else if (format === "json") {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `${filename}.json`, "application/json");
      }

      // Using a simple toast notification
      console.log(`${exportType} data exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data) => {
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

  const downloadFile = (content, filename, mimeType) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Export Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Type
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="readings">Temperature Readings</option>
              <option value="compliance">Compliance Report</option>
              <option value="manual">Manual Temperature Logs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value={1}>Last 1 Hour</option>
              <option value={6}>Last 6 Hours</option>
              <option value={24}>Last 24 Hours</option>
              <option value={72}>Last 3 Days</option>
              <option value={168}>Last 7 Days</option>
              <option value={720}>Last 30 Days</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="flex-1 btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={isExporting}
              className="flex-1 btn-ghost"
            >
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400 space-y-2">
            <div className="flex justify-between">
              <span>Available Sensors:</span>
              <span>{sensors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Readings (Last {timeRange}h):</span>
              <span>
                {
                  readings.filter(
                    (r) =>
                      new Date(r.observed_at) >=
                      new Date(Date.now() - timeRange * 60 * 60 * 1000),
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Manual Logs (Last {timeRange}h):</span>
              <span>
                {
                  temperatureLogs.filter(
                    (l) =>
                      new Date(l.recorded_at) >=
                      new Date(Date.now() - timeRange * 60 * 60 * 1000),
                  ).length
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span>Configured Equipment:</span>
              <span>{equipment.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ReportsAnalyticsProps {
  sensors: any[];
  readings: any[];
  equipment: any[];
  temperatureLogs: any[];
  formatTimeWithTimezone: (timeString: string) => string;
  onTimeRangeChange?: (timeRange: number) => void;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  sensors,
  readings,
  equipment,
  temperatureLogs,
  formatTimeWithTimezone,
  onTimeRangeChange,
}) => {
  return (
    <div className="card p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600/20 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Reports & Analytics
            </h2>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button className="btn-ghost">
            <Download className="h-5 w-5 mr-2" />
            Export All
          </button>
          <button className="btn-ghost">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule Report
          </button>
        </div>
      </div>
      <p className="text-gray-400 mb-6">
        Comprehensive reporting and analytics for temperature monitoring and
        compliance tracking.
      </p>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="tab grid w-full grid-cols-4 mb-8 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Temperature Charts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Report</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Sensors</p>
                  <p className="text-2xl font-bold text-white">
                    {sensors.filter((s) => s.active).length}
                  </p>
                </div>
                <Wifi className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Equipment Monitored</p>
                  <p className="text-2xl font-bold text-white">
                    {equipment.filter((e) => e.sensor_id).length}
                  </p>
                </div>
                <Thermometer className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Readings</p>
                  <p className="text-2xl font-bold text-white">
                    {readings.length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Manual Logs</p>
                  <p className="text-2xl font-bold text-white">
                    {temperatureLogs.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                Recent Temperature Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {readings.slice(0, 10).map((reading, index) => {
                  const sensor = sensors.find(
                    (s) => s.id === reading.sensor_id,
                  );
                  const equipment_item = equipment.find(
                    (e) => e.sensor_id === reading.sensor_id,
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Thermometer className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-white">
                            {sensor?.name || "Unknown Sensor"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {equipment_item?.name ||
                              sensor?.location_name ||
                              "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {reading.temperature?.toFixed(1) || "--"}°F
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatTimeWithTimezone(reading.observed_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {readings.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No temperature readings available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                Temperature Trends
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                Monitor temperature trends across your equipment with
                customizable time ranges and equipment selection.
              </p>
            </CardHeader>
            <CardContent>
              <TemperatureChart
                readings={readings}
                sensors={sensors}
                equipment={equipment}
                selectedEquipment={equipment
                  .filter((eq) => eq.sensor_id)
                  .map((eq) => eq.id)
                  .slice(0, 3)} // Default to first 3 monitored equipment
                showControls={true}
                height="h-96"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceReport
            readings={readings}
            sensors={sensors}
            equipment={equipment}
            temperatureLogs={temperatureLogs}
            timeRange={24}
          />
        </TabsContent>

        <TabsContent value="export">
          <DataExport
            readings={readings}
            sensors={sensors}
            equipment={equipment}
            temperatureLogs={temperatureLogs}
            formatTimeWithTimezone={formatTimeWithTimezone}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
