import { supabase } from "./supabase";

const SENSORPUSH_BASE_URL = "https://api.sensorpush.com/api/v1";

interface SensorPushCredentials {
  email: string;
  password: string;
}

interface SensorPushTokens {
  accesstoken: string;
  authorization?: string;
}

interface SensorPushSample {
  observed: string;
  temperature?: number;
  humidity?: number;
  dewpoint?: number;
  barometric_pressure?: number;
  altitude?: number;
  vpd?: number;
  tags?: Record<string, any>;
}

interface SensorPushSensor {
  id: string;
  name: string;
  deviceId: string;
  address: string;
  type: string;
  active: boolean;
  battery_voltage: number;
  rssi: number;
  calibration: {
    temperature: number;
    humidity: number;
  };
  alerts: {
    temperature: {
      enabled: boolean;
      min: number;
      max: number;
    };
    humidity: {
      enabled: boolean;
      min: number;
      max: number;
    };
  };
  tags: Record<string, any>;
}

interface SensorPushGateway {
  name: string;
  last_seen: string;
  last_alert: string;
  message: string;
  paired: string;
  version: string;
  tags: Record<string, any>;
}

export class SensorPushAPI {
  private organizationId: string;
  private integrationId: string;

  constructor(organizationId: string, integrationId: string) {
    this.organizationId = organizationId;
    this.integrationId = integrationId;
  }

  private async getStoredTokens(): Promise<SensorPushTokens | null> {
    const { data, error } = await supabase
      .from("sensorpush_integrations")
      .select("api_access_token, token_expires_at")
      .eq("id", this.integrationId)
      .eq("organization_id", this.organizationId)
      .single();

    if (error || !data?.api_access_token) {
      return null;
    }

    // Check if token is expired
    if (
      data.token_expires_at &&
      new Date(data.token_expires_at) <= new Date()
    ) {
      return null;
    }

    return { accesstoken: data.api_access_token };
  }

  private async storeTokens(tokens: SensorPushTokens): Promise<void> {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    await supabase
      .from("sensorpush_integrations")
      .update({
        api_access_token: tokens.accesstoken,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", this.integrationId)
      .eq("organization_id", this.organizationId);
  }

  private async authenticate(): Promise<string> {
    console.log(
      `[SensorPush API] Starting authentication for integration ${this.integrationId}`,
    );

    try {
      // First try to get stored valid tokens
      const storedTokens = await getStoredTokens(
        this.integrationId,
        this.organizationId,
      );
      if (storedTokens) {
        console.log(`[SensorPush API] Using stored access token`);
        return storedTokens.accesstoken;
      }

      console.log(`[SensorPush API] No valid stored tokens, fetching new ones`);

      // Get credentials from database
      const { data: integration, error } = await supabase
        .from("sensorpush_integrations")
        .select("email, password_hash")
        .eq("id", this.integrationId)
        .eq("organization_id", this.organizationId)
        .single();

      if (error) {
        console.error(
          `[SensorPush API] Database error fetching integration:`,
          error,
        );
        throw new Error(`Database error: ${error.message}`);
      }

      if (!integration) {
        console.error(
          `[SensorPush API] Integration not found for ID ${this.integrationId}`,
        );
        throw new Error("SensorPush integration not found");
      }

      console.log(
        `[SensorPush API] Found integration for email: ${integration.email}`,
      );

      // Step 1: Get authorization code
      console.log(`[SensorPush API] Step 1: Getting authorization code`);
      const authResponse = await fetch(
        `${SENSORPUSH_BASE_URL}/oauth/authorize`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: integration.email,
            password: integration.password_hash, // Note: In production, decrypt this
          }),
        },
      );

      if (!authResponse.ok) {
        const errorText = await authResponse.text();
        console.error(`[SensorPush API] Authorization failed:`, {
          status: authResponse.status,
          statusText: authResponse.statusText,
          body: errorText,
        });
        throw new Error(
          `Failed to authenticate with SensorPush: ${authResponse.status} ${authResponse.statusText}`,
        );
      }

      const authData = await authResponse.json();
      console.log(`[SensorPush API] Authorization successful, got auth code`);
      const authorization = authData.authorization;

      // Step 2: Get access token
      console.log(`[SensorPush API] Step 2: Getting access token`);
      const tokenResponse = await fetch(
        `${SENSORPUSH_BASE_URL}/oauth/accesstoken`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            authorization: authorization,
          }),
        },
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`[SensorPush API] Token request failed:`, {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          body: errorText,
        });
        throw new Error(
          `Failed to get access token from SensorPush: ${tokenResponse.status} ${tokenResponse.statusText}`,
        );
      }

      const tokenData = await tokenResponse.json();
      console.log(`[SensorPush API] Access token obtained successfully`);
      const tokens = { accesstoken: tokenData.accesstoken };

      // Store tokens for future use
      await this.storeTokens(tokens);
      console.log(`[SensorPush API] Tokens stored successfully`);

      return tokens.accesstoken;
    } catch (error) {
      console.error(`[SensorPush API] Authentication failed:`, error);
      throw error;
    }
  }

  async getGateways(): Promise<Record<string, SensorPushGateway>> {
    const accessToken = await this.authenticate();

    const response = await fetch(`${SENSORPUSH_BASE_URL}/devices/gateways`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch gateways from SensorPush");
    }

    return await response.json();
  }

  async getSensors(): Promise<Record<string, SensorPushSensor>> {
    const accessToken = await this.authenticate();

    const response = await fetch(`${SENSORPUSH_BASE_URL}/devices/sensors`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sensors from SensorPush");
    }

    return await response.json();
  }

  async getSamples(
    options: {
      sensors?: string[];
      limit?: number;
      startTime?: string;
      stopTime?: string;
      measures?: string[];
    } = {},
  ): Promise<{
    sensors: Record<string, SensorPushSample[]>;
    last_time: string;
    total_samples: number;
    total_sensors: number;
    truncated: boolean;
  }> {
    console.log(`[SensorPush API] Getting samples with options:`, options);

    // Implement retry logic with exponential backoff for timeout handling
    const fetchWithRetry = async (
      retriesLeft = 3,
      delay = 1000,
    ): Promise<any> => {
      try {
        const accessToken = await this.authenticate();

        const body: any = {
          limit: options.limit || 1000,
          measures: options.measures || ["temperature", "humidity", "dewpoint"],
        };

        if (options.sensors) {
          body.sensors = options.sensors;
        }

        if (options.startTime) {
          body.startTime = options.startTime;
        }

        if (options.stopTime) {
          body.stopTime = options.stopTime;
        }

        console.log(
          `[SensorPush API] Request body (attempt ${4 - retriesLeft}):`,
          body,
        );

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`[SensorPush API] Request timeout after 30 seconds`);
          controller.abort();
        }, 30000); // 30 second timeout

        const response = await fetch(`${SENSORPUSH_BASE_URL}/samples`, {
          method: "POST",
          headers: {
            accept: "application/json",
            Authorization: accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[SensorPush API] Samples request failed:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
            attempt: 4 - retriesLeft,
          });

          // Parse error response to get more details
          let errorDetails = null;
          try {
            errorDetails = JSON.parse(errorText);
          } catch (e) {
            // Error text is not JSON
          }

          // Check if this is a timeout or server error that we should retry
          const isRetryableError =
            response.status >= 500 ||
            (errorDetails && errorDetails.type === "INTEGRATION_TIMEOUT") ||
            response.status === 429; // Rate limiting

          if (isRetryableError && retriesLeft > 0) {
            console.log(
              `[SensorPush API] Retryable error detected, retrying in ${delay}ms...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchWithRetry(retriesLeft - 1, delay * 2); // Exponential backoff
          }

          throw new Error(
            `Failed to fetch samples from SensorPush: ${response.status} ${response.statusText}${errorDetails ? ` - ${errorDetails.message}` : ""}`,
          );
        }

        const data = await response.json();
        console.log(`[SensorPush API] Samples response:`, {
          total_samples: data.total_samples,
          total_sensors: data.total_sensors,
          truncated: data.truncated,
          sensor_count: Object.keys(data.sensors || {}).length,
          attempt: 4 - retriesLeft,
        });

        return data;
      } catch (error) {
        console.error(
          `[SensorPush API] Error on attempt ${4 - retriesLeft}:`,
          error,
        );

        // Check if this is a network/timeout error that we should retry
        const isNetworkError =
          error.name === "AbortError" ||
          error.message.includes("fetch") ||
          error.message.includes("network") ||
          error.message.includes("timeout");

        if (isNetworkError && retriesLeft > 0) {
          console.log(
            `[SensorPush API] Network error detected, retrying in ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(retriesLeft - 1, delay * 2); // Exponential backoff
        }

        throw error;
      }
    };

    try {
      return await fetchWithRetry();
    } catch (error) {
      console.error(`[SensorPush API] All retry attempts failed:`, error);
      throw error;
    }
  }

  async syncSensorsToDatabase(): Promise<void> {
    try {
      // Sync gateways
      const gateways = await this.getGateways();
      for (const [gatewayId, gateway] of Object.entries(gateways)) {
        await supabase.from("sensorpush_gateways").upsert(
          {
            id: gatewayId,
            organization_id: this.organizationId,
            integration_id: this.integrationId,
            name: gateway.name,
            last_seen: gateway.last_seen,
            last_alert: gateway.last_alert,
            message: gateway.message,
            paired: gateway.paired === "true",
            version: gateway.version,
            tags: gateway.tags,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        );
      }

      // Sync sensors
      const sensors = await this.getSensors();
      for (const [sensorId, sensor] of Object.entries(sensors)) {
        await supabase.from("sensorpush_sensors").upsert(
          {
            id: sensorId,
            organization_id: this.organizationId,
            integration_id: this.integrationId,
            name: sensor.name,
            device_id: sensor.deviceId,
            address: sensor.address,
            type: sensor.type,
            active: sensor.active,
            battery_voltage: sensor.battery_voltage,
            rssi: sensor.rssi,
            calibration: sensor.calibration,
            alerts: sensor.alerts,
            tags: sensor.tags,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        );
      }

      // Update last sync time
      await supabase
        .from("sensorpush_integrations")
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", this.integrationId);
    } catch (error) {
      console.error("Error syncing SensorPush data:", error);
      throw error;
    }
  }

  async syncReadingsToDatabase(startTime?: string): Promise<void> {
    console.log(
      `[SensorPush API] Starting readings sync for organization ${this.organizationId}`,
    );

    try {
      const options: any = {
        limit: 1000, // Reduced from 10000 to avoid timeouts
        measures: [
          "temperature",
          "humidity",
          "dewpoint",
          "barometric_pressure",
          "altitude",
          "vpd",
        ],
      };

      if (startTime) {
        console.log(`[SensorPush API] Using provided start time: ${startTime}`);
        options.startTime = startTime;
      } else {
        // Get the last reading time from database
        console.log(
          `[SensorPush API] Fetching last reading time from database`,
        );
        const { data: lastReading, error: lastReadingError } = await supabase
          .from("sensorpush_readings")
          .select("observed_at")
          .eq("organization_id", this.organizationId)
          .order("observed_at", { ascending: false })
          .limit(1)
          .single();

        if (lastReadingError && lastReadingError.code !== "PGRST116") {
          console.error(
            `[SensorPush API] Error fetching last reading:`,
            lastReadingError,
          );
        }

        if (lastReading) {
          console.log(
            `[SensorPush API] Last reading found: ${lastReading.observed_at}`,
          );
          options.startTime = lastReading.observed_at;
        } else {
          console.log(
            `[SensorPush API] No previous readings found, limiting to last 24 hours to avoid timeout`,
          );
          // Limit to last 24 hours for initial sync to avoid timeouts
          options.startTime = new Date(
            Date.now() - 24 * 60 * 60 * 1000,
          ).toISOString();
        }
      }

      console.log(
        `[SensorPush API] Attempting to fetch samples with timeout protection...`,
      );
      const samplesData = await this.getSamples(options);

      // Insert readings into database
      const readings = [];
      for (const [sensorId, samples] of Object.entries(samplesData.sensors)) {
        console.log(
          `[SensorPush API] Processing ${samples.length} samples for sensor ${sensorId}`,
        );
        for (const sample of samples) {
          readings.push({
            sensor_id: sensorId,
            organization_id: this.organizationId,
            observed_at: sample.observed,
            temperature: sample.temperature,
            humidity: sample.humidity,
            dewpoint: sample.dewpoint,
            barometric_pressure: sample.barometric_pressure,
            altitude: sample.altitude,
            vpd: sample.vpd,
            tags: sample.tags || {},
          });
        }
      }

      console.log(
        `[SensorPush API] Prepared ${readings.length} readings for database insertion`,
      );

      if (readings.length > 0) {
        // Insert in batches to avoid database timeouts
        const batchSize = 100;
        for (let i = 0; i < readings.length; i += batchSize) {
          const batch = readings.slice(i, i + batchSize);
          console.log(
            `[SensorPush API] Inserting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(readings.length / batchSize)} (${batch.length} readings)`,
          );

          const { error: insertError } = await supabase
            .from("sensorpush_readings")
            .insert(batch);

          if (insertError) {
            console.error(
              `[SensorPush API] Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
              insertError,
            );
            throw insertError;
          }
        }

        console.log(
          `[SensorPush API] Successfully inserted ${readings.length} readings in ${Math.ceil(readings.length / batchSize)} batches`,
        );
      } else {
        console.log(`[SensorPush API] No new readings to insert`);
      }

      console.log(`[SensorPush API] Readings sync completed successfully`);
    } catch (error) {
      console.error(
        `[SensorPush API] Error syncing SensorPush readings:`,
        error,
      );
      throw error;
    }
  }
}

// Helper function to get stored tokens (fix the reference)
const getStoredTokens = async (
  integrationId: string,
  organizationId: string,
): Promise<SensorPushTokens | null> => {
  const { data, error } = await supabase
    .from("sensorpush_integrations")
    .select("api_access_token, token_expires_at")
    .eq("id", integrationId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !data?.api_access_token) {
    return null;
  }

  // Check if token is expired
  if (data.token_expires_at && new Date(data.token_expires_at) <= new Date()) {
    return null;
  }

  return { accesstoken: data.api_access_token };
};

export default SensorPushAPI;
