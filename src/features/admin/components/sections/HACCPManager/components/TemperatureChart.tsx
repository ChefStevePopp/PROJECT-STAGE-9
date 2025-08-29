import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Thermometer, AlertCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

interface TemperatureChartProps {
  equipmentTypeFilter?: string;
  timeRange?: number;
  selectedEquipment?: string[];
  onEquipmentSelectionChange?: (selected: string[]) => void;
  showControls?: boolean;
  height?: string;
}

interface SensorData {
  id: string;
  name: string;
  location_name: string | null;
  active: boolean;
}

interface ReadingData {
  id: string;
  sensor_id: string;
  observed_at: string;
  temperature: number | null;
}

interface ChartDataPoint {
  time: number;
  timestamp: number;
  [key: string]: number | string;
}

interface ChartData {
  data: ChartDataPoint[];
  lines: LineConfig[];
  timeRange: {
    start: number;
    end: number;
  };
}

interface LineConfig {
  dataKey: string;
  name: string;
  stroke: string;
  strokeWidth: number;
  dot: boolean;
  connectNulls: boolean;
}

const COLOR_PALETTE = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

const TIME_RANGE_OPTIONS = [
  { value: 1, label: "1 Hour" },
  { value: 6, label: "6 Hours" },
  { value: 12, label: "12 Hours" },
  { value: 24, label: "24 Hours" },
  { value: 48, label: "48 Hours" },
  { value: 168, label: "7 Days" },
];

// Apply time-based sampling to readings - clean and straightforward
const applySampling = (
  readings: ReadingData[],
  intervalMinutes: number,
): ReadingData[] => {
  if (readings.length === 0) return readings;

  const intervalMs = intervalMinutes * 60 * 1000;
  const sampledReadings: ReadingData[] = [];
  const sensorBuckets = new Map<string, Map<number, ReadingData[]>>();

  // Group readings by sensor and time buckets
  readings.forEach((reading) => {
    const timestamp = new Date(reading.observed_at).getTime();
    const bucketTime = Math.floor(timestamp / intervalMs) * intervalMs;

    if (!sensorBuckets.has(reading.sensor_id)) {
      sensorBuckets.set(reading.sensor_id, new Map());
    }

    const sensorMap = sensorBuckets.get(reading.sensor_id)!;
    if (!sensorMap.has(bucketTime)) {
      sensorMap.set(bucketTime, []);
    }

    sensorMap.get(bucketTime)!.push(reading);
  });

  // Average readings within each bucket
  sensorBuckets.forEach((timeBuckets, sensorId) => {
    timeBuckets.forEach((bucketReadings, bucketTime) => {
      if (bucketReadings.length === 0) return;

      // Calculate average temperature for this time bucket
      const avgTemperature =
        bucketReadings.reduce(
          (sum, reading) => sum + (reading.temperature || 0),
          0,
        ) / bucketReadings.length;

      // Use the most recent reading in the bucket as the base
      const mostRecentReading = bucketReadings.reduce((latest, current) =>
        new Date(current.observed_at) > new Date(latest.observed_at)
          ? current
          : latest,
      );

      sampledReadings.push({
        ...mostRecentReading,
        temperature: Math.round(avgTemperature * 10) / 10, // Round to 1 decimal
        observed_at: new Date(bucketTime).toISOString(), // Use bucket time for consistent intervals
      });
    });
  });

  // Sort by timestamp
  return sampledReadings.sort(
    (a, b) =>
      new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime(),
  );
};

const REFERENCE_LINES = {
  fridge: [{ y: 41, stroke: "#F59E0B", label: "41°F Limit" }],
  freezer: [{ y: 0, stroke: "#06B6D4", label: "0°F Limit" }],
  hot_holding: [{ y: 135, stroke: "#EF4444", label: "135°F Minimum" }],
};

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  equipmentTypeFilter,
  timeRange = 24,
  selectedEquipment = [],
  onEquipmentSelectionChange,
  showControls = true,
  height = "h-80",
}) => {
  const { organizationId } = useAuth();
  const [localTimeRange, setLocalTimeRange] = useState(timeRange);
  const [localSelectedEquipment, setLocalSelectedEquipment] = useState<
    string[]
  >([]);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [readings, setReadings] = useState<ReadingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize with empty selections and let auto-select handle it
  useEffect(() => {
    console.log(
      `[TemperatureChart] Initializing with empty selections, will auto-select from database`,
    );
    setLocalSelectedEquipment([]);
  }, []);

  // Calculate optimal data sampling based on time range - simplified and logical
  const getOptimalSampling = useCallback((hours: number) => {
    // Simple, predictable intervals that make sense for restaurant operations
    if (hours <= 1) return 5; // 1 hour: every 5 minutes
    if (hours <= 6) return 30; // 6 hours: every 30 minutes
    if (hours <= 12) return 60; // 12 hours: every hour
    if (hours <= 48) return 120; // 48 hours: every 2 hours
    return 240; // 7+ days: every 4 hours
  }, []);

  // Stable data loading function with useCallback
  const loadData = useCallback(
    async (orgId: string, hours: number) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(`[TemperatureChart] Loading data for ${hours} hours`);

        // Load sensors
        const { data: sensorsData, error: sensorsError } = await supabase
          .from("sensorpush_sensors")
          .select("id, name, location_name, active")
          .eq("organization_id", orgId)
          .eq("active", true)
          .order("name");

        if (sensorsError) throw sensorsError;
        console.log(
          `[TemperatureChart] Found ${sensorsData?.length || 0} sensors`,
        );

        // Log sensor IDs to check format
        if (sensorsData && sensorsData.length > 0) {
          console.log(
            `[TemperatureChart] Sample sensor IDs:`,
            sensorsData
              .slice(0, 3)
              .map((s) => `${s.id} (${typeof s.id}) - ${s.name}`),
          );
        }

        // Calculate time boundaries - query the exact time range requested
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        console.log(
          `[TemperatureChart] Querying time range: ${startTime.toISOString()} to ${endTime.toISOString()}`,
        );
        console.log(
          `[TemperatureChart] Current time: ${new Date().toISOString()}`,
        );
        console.log(
          `[TemperatureChart] Time range span: ${((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)).toFixed(1)} hours`,
        );
        console.log(`[TemperatureChart] Requested hours: ${hours}`);

        // Query readings for the EXACT time range requested by the user
        const { data: readingsData, error: readingsError } = await supabase
          .from("sensorpush_readings")
          .select("id, sensor_id, observed_at, temperature")
          .eq("organization_id", orgId)
          .gte("observed_at", startTime.toISOString())
          .lte("observed_at", endTime.toISOString())
          .not("temperature", "is", null)
          .order("observed_at", { ascending: true })
          .limit(50000); // Increased limit further to ensure we get all data

        if (readingsError) {
          console.error(
            `[TemperatureChart] Database query error:`,
            readingsError,
          );
          throw readingsError;
        }

        console.log(
          `[TemperatureChart] Raw query returned ${readingsData?.length || 0} readings`,
        );

        // Debug: Log the actual SQL-like query being executed
        console.log(`[TemperatureChart] Query parameters:`);
        console.log(`  - Table: sensorpush_readings`);
        console.log(`  - organization_id = "${orgId}"`);
        console.log(`  - observed_at >= "${startTime.toISOString()}"`);
        console.log(`  - observed_at <= "${endTime.toISOString()}"`);
        console.log(`  - temperature IS NOT NULL`);
        console.log(`  - ORDER BY observed_at ASC`);
        console.log(`  - LIMIT 50000`);

        // Log some sample data to verify we're getting current data
        if (readingsData && readingsData.length > 0) {
          console.log(
            `[TemperatureChart] First reading: ${readingsData[0].observed_at} (sensor: ${readingsData[0].sensor_id}, temp: ${readingsData[0].temperature}°F)`,
          );
          console.log(
            `[TemperatureChart] Last reading: ${readingsData[readingsData.length - 1].observed_at} (sensor: ${readingsData[readingsData.length - 1].sensor_id}, temp: ${readingsData[readingsData.length - 1].temperature}°F)`,
          );

          // Calculate actual time span of returned data
          const firstTime = new Date(readingsData[0].observed_at);
          const lastTime = new Date(
            readingsData[readingsData.length - 1].observed_at,
          );
          const actualHours =
            (lastTime.getTime() - firstTime.getTime()) / (1000 * 60 * 60);
          console.log(
            `[TemperatureChart] Actual data spans ${actualHours.toFixed(1)} hours`,
          );

          // Log all unique sensor IDs to check format
          const uniqueSensors = [
            ...new Set(readingsData.map((r) => r.sensor_id)),
          ];
          console.log(
            `[TemperatureChart] Unique sensor IDs in data:`,
            uniqueSensors,
          );

          // Check distribution of readings across the time range
          const hourBuckets = {};
          readingsData.forEach((r) => {
            const hour = new Date(r.observed_at).getHours();
            hourBuckets[hour] = (hourBuckets[hour] || 0) + 1;
          });
          console.log(`[TemperatureChart] Readings per hour:`, hourBuckets);
        } else {
          console.log(
            `[TemperatureChart] NO READINGS RETURNED - checking query parameters`,
          );
          console.log(`[TemperatureChart] Organization ID: ${orgId}`);
          console.log(
            `[TemperatureChart] Expected to find readings between ${startTime.toISOString()} and ${endTime.toISOString()}`,
          );

          // Let's try a simpler query to see if there's ANY data for this org
          console.log(
            `[TemperatureChart] Attempting simpler query to check organization data...`,
          );
          const { data: testData, error: testError } = await supabase
            .from("sensorpush_readings")
            .select("id, observed_at")
            .eq("organization_id", orgId)
            .order("observed_at", { ascending: false })
            .limit(5);

          if (testError) {
            console.error(`[TemperatureChart] Test query error:`, testError);
          } else {
            console.log(
              `[TemperatureChart] Test query returned ${testData?.length || 0} recent readings:`,
              testData?.map((r) => r.observed_at),
            );
          }
        }

        // Verify we got data for the correct time range
        if (readingsData && readingsData.length > 0) {
          const firstReading = new Date(readingsData[0].observed_at);
          const lastReading = new Date(
            readingsData[readingsData.length - 1].observed_at,
          );
          const actualHours =
            (lastReading.getTime() - firstReading.getTime()) / (1000 * 60 * 60);
          console.log(
            `[TemperatureChart] Raw data spans ${actualHours.toFixed(1)} hours: ${firstReading.toISOString()} to ${lastReading.toISOString()}`,
          );
        }

        console.log(
          `[TemperatureChart] Using all ${readingsData?.length || 0} readings without sampling`,
        );

        // Verify we got data for the correct time range
        if (readingsData && readingsData.length > 0) {
          const firstReading = new Date(readingsData[0].observed_at);
          const lastReading = new Date(
            readingsData[readingsData.length - 1].observed_at,
          );
          const actualHours =
            (lastReading.getTime() - firstReading.getTime()) / (1000 * 60 * 60);
          console.log(
            `[TemperatureChart] Raw data spans ${actualHours.toFixed(1)} hours: ${firstReading.toISOString()} to ${lastReading.toISOString()}`,
          );
        }

        setSensors(sensorsData || []);
        setReadings(readingsData || []);
      } catch (err: any) {
        console.error("Error loading temperature data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    },
    [getOptimalSampling],
  );

  // Force fresh data load when time range changes
  useEffect(() => {
    if (organizationId) {
      console.log(
        `[TemperatureChart] Time range changed to ${localTimeRange} hours - forcing fresh data load`,
      );
      // Clear existing data first to force a fresh load
      setReadings([]);
      loadData(organizationId, localTimeRange);
    }
  }, [organizationId, localTimeRange, loadData]);

  // Filter sensors based on equipment type
  const filteredSensors = useMemo(() => {
    if (!equipmentTypeFilter) return sensors;

    return sensors.filter((sensor) => {
      if (!sensor.location_name) return false;

      const location = sensor.location_name.toLowerCase();
      switch (equipmentTypeFilter) {
        case "fridge":
          return (
            location.includes("fridge") ||
            location.includes("cooler") ||
            location.includes("cold")
          );
        case "freezer":
          return location.includes("freezer");
        case "hot_holding":
          return location.includes("hot") || location.includes("warming");
        default:
          return true;
      }
    });
  }, [sensors, equipmentTypeFilter]);

  // Auto-select equipment if none selected - use callback to prevent re-renders
  const handleAutoSelect = useCallback(() => {
    // Only auto-select if we have no valid selections
    const validSelections = localSelectedEquipment.filter((id) =>
      filteredSensors.some((sensor) => sensor.id === id),
    );

    if (validSelections.length === 0 && filteredSensors.length > 0) {
      console.log(
        `[TemperatureChart] Auto-selecting sensors from available sensors`,
      );
      const autoSelect = filteredSensors.slice(0, 3).map((sensor) => sensor.id);
      console.log(`[TemperatureChart] Auto-selected sensor IDs:`, autoSelect);
      setLocalSelectedEquipment(autoSelect);
      onEquipmentSelectionChange?.(autoSelect);
    } else if (validSelections.length !== localSelectedEquipment.length) {
      // Clean up invalid selections
      console.log(`[TemperatureChart] Cleaning up invalid sensor selections`);
      console.log(`[TemperatureChart] Before cleanup:`, localSelectedEquipment);
      console.log(`[TemperatureChart] After cleanup:`, validSelections);
      setLocalSelectedEquipment(validSelections);
      onEquipmentSelectionChange?.(validSelections);
    }
  }, [filteredSensors, localSelectedEquipment, onEquipmentSelectionChange]);

  useEffect(() => {
    handleAutoSelect();
  }, [handleAutoSelect]);

  // Create stable color mapping for selected equipment
  const selectedSensorColorMap = useMemo(() => {
    const colorMap = new Map<string, string>();
    localSelectedEquipment.forEach((sensorId, index) => {
      colorMap.set(sensorId, COLOR_PALETTE[index % COLOR_PALETTE.length]);
    });
    return colorMap;
  }, [localSelectedEquipment]);

  // Process chart data with static time axis based on selected range
  const chartData = useMemo(() => {
    if (!localSelectedEquipment.length || !sensors.length) {
      console.log(
        `[TemperatureChart] No chart data: equipment=${localSelectedEquipment.length}, sensors=${sensors.length}`,
      );
      return { data: [], lines: [], timeRange: { start: 0, end: 0 } };
    }

    // Create sensor map for quick lookup
    const sensorMap = new Map(sensors.map((s) => [s.id, s]));

    // Calculate STATIC time boundaries based on user selection - this is the key fix!
    const endTime = new Date().getTime();
    const startTime = endTime - localTimeRange * 60 * 60 * 1000;

    console.log(
      `[TemperatureChart] Static time axis: ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`,
    );

    // Filter readings by selected sensors AND ensure they're within our time range
    const filteredReadings = readings.filter((reading) => {
      const readingTime = new Date(reading.observed_at).getTime();
      const isInTimeRange = readingTime >= startTime && readingTime <= endTime;
      const isSelectedSensor = localSelectedEquipment.includes(
        reading.sensor_id,
      );

      // Debug logging for the first few readings to see what's happening
      if (readings.indexOf(reading) < 5) {
        console.log(
          `[TemperatureChart] Reading ${readings.indexOf(reading)}: sensor_id="${reading.sensor_id}" (${typeof reading.sensor_id}), isSelected=${isSelectedSensor}, inTimeRange=${isInTimeRange}`,
        );
        console.log(
          `[TemperatureChart] Selected equipment:`,
          localSelectedEquipment,
        );
        console.log(
          `[TemperatureChart] Selected equipment types:`,
          localSelectedEquipment.map((id) => typeof id),
        );
      }

      return isSelectedSensor && reading.temperature != null && isInTimeRange;
    });

    console.log(
      `[TemperatureChart] Filtered ${filteredReadings.length} readings for selected sensors in time range`,
    );
    console.log(
      `[TemperatureChart] Original readings: ${readings.length}, Selected sensors: ${localSelectedEquipment.length}`,
    );

    // Show which sensors have data vs which are selected
    if (readings.length > 0) {
      const availableSensors = [...new Set(readings.map((r) => r.sensor_id))];
      console.log(`[TemperatureChart] Available sensor IDs:`, availableSensors);
      console.log(
        `[TemperatureChart] Selected sensor IDs:`,
        localSelectedEquipment,
      );

      // Check if any selected sensors match available sensors
      const matchingSensors = localSelectedEquipment.filter((selected) =>
        availableSensors.some((available) => available === selected),
      );
      console.log(`[TemperatureChart] Matching sensors:`, matchingSensors);

      if (matchingSensors.length === 0) {
        console.log(
          `[TemperatureChart] *** NO MATCHING SENSORS - This is the problem! ***`,
        );
        console.log(
          `[TemperatureChart] Available:`,
          availableSensors.map((id) => `"${id}" (${typeof id})`),
        );
        console.log(
          `[TemperatureChart] Selected:`,
          localSelectedEquipment.map((id) => `"${id}" (${typeof id})`),
        );
      }
    }

    // Sort readings by time (they should already be sorted from sampling)
    const sortedReadings = filteredReadings.sort(
      (a, b) =>
        new Date(a.observed_at).getTime() - new Date(b.observed_at).getTime(),
    );

    // Convert to chart data format
    const dataPointsMap = new Map<number, ChartDataPoint>();

    sortedReadings.forEach((reading) => {
      const timestamp = new Date(reading.observed_at).getTime();
      const sensor = sensorMap.get(reading.sensor_id);

      if (!sensor || reading.temperature == null) return;

      if (!dataPointsMap.has(timestamp)) {
        dataPointsMap.set(timestamp, {
          time: timestamp,
          timestamp: timestamp,
        });
      }

      const point = dataPointsMap.get(timestamp)!;
      const key = `sensor_${reading.sensor_id}`;
      point[key] = reading.temperature;
    });

    // Convert to array and sort by time
    const data = Array.from(dataPointsMap.values()).sort(
      (a, b) => a.time - b.time,
    );

    console.log(
      `[TemperatureChart] Generated ${data.length} chart data points`,
    );

    if (data.length > 0) {
      const actualStartTime = data[0].time;
      const actualEndTime = data[data.length - 1].time;
      console.log(
        `[TemperatureChart] Actual data spans: ${new Date(actualStartTime).toISOString()} to ${new Date(actualEndTime).toISOString()}`,
      );
    }

    // Create line configurations with consistent colors
    const lines: LineConfig[] = localSelectedEquipment
      .map((sensorId) => {
        const sensor = sensorMap.get(sensorId);
        if (!sensor) return null;

        const key = `sensor_${sensorId}`;
        const color = selectedSensorColorMap.get(sensorId) || COLOR_PALETTE[0];

        return {
          dataKey: key,
          name: `${sensor.name}${sensor.location_name ? ` (${sensor.location_name})` : ""}`,
          stroke: color,
          strokeWidth: 2,
          dot: false,
          connectNulls: false,
        };
      })
      .filter((line): line is LineConfig => line !== null);

    // Return static time boundaries regardless of actual data
    return {
      data,
      lines,
      timeRange: {
        start: startTime, // Static start time
        end: endTime, // Static end time (now)
      },
    };
  }, [
    readings,
    sensors,
    localSelectedEquipment,
    selectedSensorColorMap,
    localTimeRange,
  ]);

  // Handle equipment selection with useCallback
  const handleEquipmentToggle = useCallback(
    (sensorId: string) => {
      const newSelection = localSelectedEquipment.includes(sensorId)
        ? localSelectedEquipment.filter((id) => id !== sensorId)
        : [...localSelectedEquipment, sensorId];

      setLocalSelectedEquipment(newSelection);
      onEquipmentSelectionChange?.(newSelection);
    },
    [localSelectedEquipment, onEquipmentSelectionChange],
  );

  // Handle time range change with useCallback
  const handleTimeRangeChange = useCallback((newTimeRange: number) => {
    setLocalTimeRange(newTimeRange);
  }, []);

  // Format tooltip labels with useCallback
  const formatTooltipLabel = useCallback(
    (timestamp: number) => {
      const date = new Date(timestamp);
      if (localTimeRange <= 1) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      } else if (localTimeRange <= 24) {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        });
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          hour12: true,
        });
      }
    },
    [localTimeRange],
  );

  // Format tooltip values with useCallback
  const formatTooltipValue = useCallback(
    (value: number | null, name: string) => {
      return value ? [`${value.toFixed(1)}°F`, name] : ["No data", name];
    },
    [],
  );

  // Get reference lines for equipment type
  const referenceLines = equipmentTypeFilter
    ? REFERENCE_LINES[equipmentTypeFilter] || []
    : [];

  if (isLoading) {
    return (
      <div
        className={`${height} bg-gray-900/50 rounded-lg p-4 flex items-center justify-center`}
      >
        <div className="text-center text-gray-400">
          <Thermometer className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p>Loading temperature data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${height} bg-gray-900/50 rounded-lg p-4 flex items-center justify-center`}
      >
        <div className="text-center text-red-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Error loading temperature data</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      {showControls && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-800/30 rounded-lg">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
              Time Range:
            </label>
            <select
              value={localTimeRange}
              onChange={(e) => handleTimeRangeChange(parseInt(e.target.value))}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Selector */}
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Sensors to Display:
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredSensors.map((sensor) => {
                const isSelected = localSelectedEquipment.includes(sensor.id);
                // Use the consistent color mapping for selected sensors
                const selectedIndex = localSelectedEquipment.indexOf(sensor.id);
                const color =
                  selectedIndex >= 0
                    ? selectedSensorColorMap.get(sensor.id) || COLOR_PALETTE[0]
                    : "#6B7280"; // Gray for unselected

                return (
                  <button
                    key={sensor.id}
                    onClick={() => handleEquipmentToggle(sensor.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all ${
                      isSelected
                        ? "bg-gray-600 text-white border border-gray-500"
                        : "bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span
                      className="truncate max-w-32"
                      title={`${sensor.name} (${sensor.location_name})`}
                    >
                      {sensor.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {localSelectedEquipment.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">
                Select sensors to display on the chart
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={`${height} bg-gray-900/50 rounded-lg p-4`}>
        {!chartData.data || chartData.data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Thermometer className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No temperature data available</p>
              <p className="text-sm mt-1">
                {filteredSensors.length === 0
                  ? "No monitored sensors found"
                  : localSelectedEquipment.length === 0
                    ? "Select sensors to display"
                    : `No data for selected sensors in the last ${localTimeRange} hour${localTimeRange !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.3}
              />

              <XAxis
                dataKey="time"
                type="number"
                scale="time"
                domain={[chartData.timeRange.start, chartData.timeRange.end]}
                tickFormatter={formatTooltipLabel}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#4B5563" }}
                tickLine={{ stroke: "#4B5563" }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
                tickCount={
                  localTimeRange <= 1
                    ? 6
                    : localTimeRange <= 6
                      ? 8
                      : localTimeRange <= 24
                        ? 12
                        : 8
                }
              />

              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}°F`}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                axisLine={{ stroke: "#4B5563" }}
                tickLine={{ stroke: "#4B5563" }}
              />

              <Tooltip
                labelFormatter={formatTooltipLabel}
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                labelStyle={{ color: "#D1D5DB" }}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "12px",
                  color: "#D1D5DB",
                }}
              />

              {/* Reference lines */}
              {referenceLines.map((line, index) => (
                <ReferenceLine
                  key={index}
                  y={line.y}
                  stroke={line.stroke}
                  strokeDasharray="5 5"
                  label={{
                    value: line.label,
                    position: "topLeft",
                    style: {
                      fill: line.stroke,
                      fontSize: "12px",
                      fontWeight: "bold",
                    },
                  }}
                />
              ))}

              {/* Temperature lines */}
              {chartData.lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  name={line.name}
                  stroke={line.stroke}
                  strokeWidth={line.strokeWidth}
                  dot={line.dot}
                  connectNulls={line.connectNulls}
                  activeDot={{
                    r: 4,
                    stroke: line.stroke,
                    strokeWidth: 2,
                    fill: "#1F2937",
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default TemperatureChart;
