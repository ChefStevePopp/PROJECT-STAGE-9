import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { SensorPushAPI } from "@/lib/sensorpush-api";
import { useAuth } from "./useAuth";
import toast from "react-hot-toast";

interface SensorPushIntegration {
  id: string;
  organization_id: string;
  email: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

interface SensorPushSensor {
  id: string;
  name: string;
  device_id: string;
  active: boolean;
  battery_voltage: number;
  rssi: number;
  location_name: string | null;
  station_assignment: string | null;
  tags: Record<string, any>;
}

interface SensorPushReading {
  id: string;
  sensor_id: string;
  observed_at: string;
  temperature: number | null;
  humidity: number | null;
  dewpoint: number | null;
  barometric_pressure: number | null;
  altitude: number | null;
  vpd: number | null;
}

interface HACCPTemperatureLog {
  id: string;
  location_name: string;
  station: string | null;
  equipment_type: "fridge" | "freezer" | "hot_holding" | "cold_holding";
  temperature: number;
  recorded_at: string;
  recorded_by: string | null;
  sensor_id: string | null;
  is_manual: boolean;
  status: "normal" | "warning" | "critical";
  notes: string | null;
  corrective_action: string | null;
}

export function useSensorPush() {
  const { organizationId } = useAuth();
  const [integration, setIntegration] = useState<SensorPushIntegration | null>(
    null,
  );
  const [sensors, setSensors] = useState<SensorPushSensor[]>([]);
  const [readings, setReadings] = useState<SensorPushReading[]>([]);
  const [temperatureLogs, setTemperatureLogs] = useState<HACCPTemperatureLog[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load integration data
  const loadIntegration = useCallback(async () => {
    if (!organizationId) {
      console.log(
        `[useSensorPush] No organization ID, skipping integration load`,
      );
      return;
    }

    console.log(
      `[useSensorPush] Loading integration for organization: ${organizationId}`,
    );

    try {
      const { data, error } = await supabase
        .from("sensorpush_integrations")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(
          `[useSensorPush] Database error loading integration:`,
          error,
        );
        throw error;
      }

      if (data) {
        console.log(`[useSensorPush] Integration loaded successfully:`, {
          id: data.id,
          email: data.email,
          last_sync_at: data.last_sync_at,
          is_active: data.is_active,
        });
      } else {
        console.log(`[useSensorPush] No active integration found`);
      }

      setIntegration(data);
    } catch (err: any) {
      console.error(
        `[useSensorPush] Error loading SensorPush integration:`,
        err,
      );
      setError(err.message);
    }
  }, [organizationId]);

  // Load sensors
  const loadSensors = useCallback(async () => {
    if (!organizationId) {
      console.log(`[useSensorPush] No organization ID, skipping sensors load`);
      return;
    }

    console.log(
      `[useSensorPush] Loading sensors for organization: ${organizationId}`,
    );

    try {
      const { data, error } = await supabase
        .from("sensorpush_sensors")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("active", true)
        .order("name");

      if (error) {
        console.error(`[useSensorPush] Database error loading sensors:`, error);
        throw error;
      }

      console.log(
        `[useSensorPush] Loaded ${(data || []).length} sensors:`,
        (data || []).map((s) => ({
          id: s.id,
          name: s.name,
          location: s.location_name,
          active: s.active,
        })),
      );

      setSensors(data || []);
    } catch (err: any) {
      console.error(`[useSensorPush] Error loading sensors:`, err);
      setError(err.message);
    }
  }, [organizationId]);

  // Load recent readings
  const loadReadings = useCallback(
    async (sensorIds?: string[], hours: number = 168) => {
      // Increased to 7 days (168 hours)
      if (!organizationId) {
        console.log(
          `[useSensorPush] No organization ID, skipping readings load`,
        );
        return;
      }

      const timeThreshold = new Date(
        Date.now() - hours * 60 * 60 * 1000,
      ).toISOString();
      console.log(
        `[useSensorPush] Loading readings for organization: ${organizationId}, since: ${timeThreshold}`,
      );
      if (sensorIds) {
        console.log(`[useSensorPush] Filtering for sensor IDs:`, sensorIds);
      }

      try {
        // First, let's check total count without time filter to debug
        const { count: totalCount } = await supabase
          .from("sensorpush_readings")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organizationId);

        console.log(
          `[useSensorPush] Total readings in database: ${totalCount}`,
        );

        let query = supabase
          .from("sensorpush_readings")
          .select("*")
          .eq("organization_id", organizationId)
          .gte("observed_at", timeThreshold)
          .order("observed_at", { ascending: false })
          .limit(5000); // Increased limit to capture more readings

        if (sensorIds && sensorIds.length > 0) {
          query = query.in("sensor_id", sensorIds);
        }

        const { data, error } = await query;

        if (error) {
          console.error(
            `[useSensorPush] Database error loading readings:`,
            error,
          );
          throw error;
        }

        console.log(
          `[useSensorPush] Loaded ${(data || []).length} readings with time filter`,
        );

        // If no readings with time filter, try without time filter for debugging
        if (!data || data.length === 0) {
          console.log(
            `[useSensorPush] No readings found with time filter, trying without time filter...`,
          );
          const { data: allData, error: allError } = await supabase
            .from("sensorpush_readings")
            .select("*")
            .eq("organization_id", organizationId)
            .order("observed_at", { ascending: false })
            .limit(100);

          if (allError) {
            console.error(
              `[useSensorPush] Error loading all readings:`,
              allError,
            );
          } else {
            console.log(
              `[useSensorPush] Found ${(allData || []).length} total readings without time filter`,
            );
            if (allData && allData.length > 0) {
              console.log(
                `[useSensorPush] Sample readings without time filter:`,
                allData.slice(0, 3).map((r) => ({
                  sensor_id: r.sensor_id,
                  observed_at: r.observed_at,
                  temperature: r.temperature,
                  created_at: r.created_at,
                })),
              );
              // Use all data if time-filtered data is empty
              setReadings(allData);
              return;
            }
          }
        }

        if (data && data.length > 0) {
          const sensorReadingCounts = data.reduce(
            (acc, reading) => {
              acc[reading.sensor_id] = (acc[reading.sensor_id] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          console.log(
            `[useSensorPush] Readings by sensor:`,
            sensorReadingCounts,
          );

          // Log sample readings for debugging
          console.log(
            `[useSensorPush] Sample readings:`,
            data.slice(0, 3).map((r) => ({
              sensor_id: r.sensor_id,
              observed_at: r.observed_at,
              temperature: r.temperature,
              created_at: r.created_at,
            })),
          );
        }

        setReadings(data || []);
      } catch (err: any) {
        console.error(`[useSensorPush] Error loading readings:`, err);
        setError(err.message);
      }
    },
    [organizationId],
  );

  // Load temperature logs
  const loadTemperatureLogs = useCallback(
    async (equipmentType?: string, hours: number = 24) => {
      if (!organizationId) return;

      try {
        let query = supabase
          .from("haccp_temperature_logs")
          .select("*")
          .eq("organization_id", organizationId)
          .gte(
            "recorded_at",
            new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
          )
          .order("recorded_at", { ascending: false })
          .limit(500);

        if (equipmentType) {
          query = query.eq("equipment_type", equipmentType);
        }

        const { data, error } = await query;

        if (error) throw error;

        setTemperatureLogs(data || []);
      } catch (err: any) {
        console.error("Error loading temperature logs:", err);
        setError(err.message);
      }
    },
    [organizationId],
  );

  // Create integration
  const createIntegration = async (email: string, password: string) => {
    if (!organizationId) throw new Error("No organization ID");

    try {
      setIsLoading(true);

      // Note: In production, you should hash/encrypt the password
      const { data, error } = await supabase
        .from("sensorpush_integrations")
        .insert({
          organization_id: organizationId,
          email,
          password_hash: password, // TODO: Hash this properly
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setIntegration(data);
      toast.success("SensorPush integration created successfully");

      // Immediately sync sensors
      await syncSensors(data.id);

      return data;
    } catch (err: any) {
      console.error("Error creating integration:", err);
      toast.error("Failed to create SensorPush integration");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync sensors from SensorPush API
  const syncSensors = async (integrationId?: string) => {
    const activeIntegration =
      integration || (integrationId ? { id: integrationId } : null);

    if (!organizationId || !activeIntegration) {
      console.log(
        `[useSensorPush] Cannot sync sensors - missing organizationId or integration`,
      );
      return;
    }

    console.log(
      `[useSensorPush] Starting sensor sync for integration: ${activeIntegration.id}`,
    );

    try {
      setIsSyncing(true);

      const api = new SensorPushAPI(organizationId, activeIntegration.id);
      await api.syncSensorsToDatabase();

      console.log(`[useSensorPush] Sensor sync completed, reloading sensors`);
      // Reload sensors
      await loadSensors();
      // Reload integration to get updated last_sync_at
      await loadIntegration();

      toast.success("Sensors synced successfully");
      console.log(`[useSensorPush] Sensor sync successful`);
    } catch (err: any) {
      console.error(`[useSensorPush] Error syncing sensors:`, err);
      toast.error(`Failed to sync sensors: ${err.message}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync readings from SensorPush API
  const syncReadings = async (startTime?: string) => {
    if (!organizationId || !integration) {
      console.log(
        `[useSensorPush] Cannot sync readings - missing organizationId or integration`,
      );
      return;
    }

    console.log(
      `[useSensorPush] Starting readings sync for integration: ${integration.id}`,
      startTime ? `from ${startTime}` : "from last sync",
    );

    try {
      setIsSyncing(true);

      const api = new SensorPushAPI(organizationId, integration.id);
      await api.syncReadingsToDatabase(startTime);

      console.log(
        `[useSensorPush] Readings sync completed, reloading readings`,
      );

      // Add a small delay to ensure database has processed all inserts
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reload readings and integration to get updated last_sync_at
      await loadReadings();
      await loadIntegration();

      toast.success("Readings synced successfully");
      console.log(`[useSensorPush] Readings sync successful`);
    } catch (err: any) {
      console.error(`[useSensorPush] Error syncing readings:`, err);
      toast.error(`Failed to sync readings: ${err.message}`);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  // Add manual temperature log
  const addTemperatureLog = async (
    log: Omit<HACCPTemperatureLog, "id" | "organization_id">,
  ) => {
    if (!organizationId) throw new Error("No organization ID");

    try {
      const { data, error } = await supabase
        .from("haccp_temperature_logs")
        .insert({
          ...log,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;

      // Reload temperature logs
      await loadTemperatureLogs();

      toast.success("Temperature log added successfully");
      return data;
    } catch (err: any) {
      console.error("Error adding temperature log:", err);
      toast.error("Failed to add temperature log");
      throw err;
    }
  };

  // Update sensor location/station assignment
  const updateSensorAssignment = async (
    sensorId: string,
    locationName: string,
    stationAssignment?: string,
  ) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from("sensorpush_sensors")
        .update({
          location_name: locationName,
          station_assignment: stationAssignment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sensorId)
        .eq("organization_id", organizationId);

      if (error) throw error;

      // Reload sensors
      await loadSensors();

      toast.success("Sensor assignment updated");
    } catch (err: any) {
      console.error("Error updating sensor assignment:", err);
      toast.error("Failed to update sensor assignment");
      throw err;
    }
  };

  // Get latest reading for a sensor
  const getLatestReading = (sensorId: string): SensorPushReading | null => {
    const sensorReadings = readings.filter((r) => r.sensor_id === sensorId);
    console.log(
      `[useSensorPush] getLatestReading for sensor ${sensorId}: found ${sensorReadings.length} readings`,
    );
    if (sensorReadings.length > 0) {
      console.log(`[useSensorPush] Latest reading:`, {
        temperature: sensorReadings[0].temperature,
        observed_at: sensorReadings[0].observed_at,
        id: sensorReadings[0].id,
      });
    }
    return sensorReadings.length > 0 ? sensorReadings[0] : null;
  };

  // Get temperature status based on equipment type and temperature
  const getTemperatureStatus = (
    temperature: number,
    equipmentType: string,
  ): "normal" | "warning" | "critical" => {
    switch (equipmentType) {
      case "fridge":
      case "cold_holding":
        if (temperature > 45) return "critical";
        if (temperature > 41) return "warning";
        return "normal";
      case "freezer":
        if (temperature > 10) return "critical";
        if (temperature > 0) return "warning";
        return "normal";
      case "hot_holding":
        if (temperature < 130) return "critical";
        if (temperature < 135) return "warning";
        return "normal";
      default:
        return "normal";
    }
  };

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      console.log(
        `[useSensorPush] Initializing data for organization: ${organizationId}`,
      );
      setIsLoading(true);
      try {
        await loadIntegration();
        await loadSensors();
        await loadReadings();
        await loadTemperatureLogs();
        console.log(`[useSensorPush] Data initialization completed`);
      } catch (err) {
        console.error(
          `[useSensorPush] Error initializing SensorPush data:`,
          err,
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      initializeData();
    } else {
      console.log(
        `[useSensorPush] No organization ID available, skipping initialization`,
      );
    }
  }, [
    organizationId,
    loadIntegration,
    loadSensors,
    loadReadings,
    loadTemperatureLogs,
  ]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!organizationId) return;

    const readingsSubscription = supabase
      .channel("sensorpush_readings")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensorpush_readings",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log(
            `[useSensorPush] Realtime reading received:`,
            payload.new,
          );
          setReadings((prev) => {
            const newReading = payload.new as SensorPushReading;
            // Check if reading already exists to avoid duplicates
            const exists = prev.some((r) => r.id === newReading.id);
            if (exists) {
              console.log(
                `[useSensorPush] Duplicate reading ignored:`,
                newReading.id,
              );
              return prev;
            }
            return [newReading, ...prev.slice(0, 4999)];
          });
        },
      )
      .subscribe();

    const logsSubscription = supabase
      .channel("haccp_temperature_logs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "haccp_temperature_logs",
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTemperatureLogs((prev) => [
              payload.new as HACCPTemperatureLog,
              ...prev.slice(0, 499),
            ]);
          } else if (payload.eventType === "UPDATE") {
            setTemperatureLogs((prev) =>
              prev.map((log) =>
                log.id === payload.new.id
                  ? (payload.new as HACCPTemperatureLog)
                  : log,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setTemperatureLogs((prev) =>
              prev.filter((log) => log.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      readingsSubscription.unsubscribe();
      logsSubscription.unsubscribe();
    };
  }, [organizationId]);

  return {
    // State
    integration,
    sensors,
    readings,
    temperatureLogs,
    isLoading,
    isSyncing,
    error,

    // Actions
    createIntegration,
    syncSensors,
    syncReadings,
    addTemperatureLog,
    updateSensorAssignment,
    loadReadings,
    loadTemperatureLogs,

    // Helpers
    getLatestReading,
    getTemperatureStatus,
  };
}
