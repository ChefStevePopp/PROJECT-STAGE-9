import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SensorPushCredentials {
  email: string;
  password_hash: string;
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

class SensorPushAPI {
  private static readonly BASE_URL = "https://api.sensorpush.com/api/v1";
  private organizationId: string;
  private integrationId: string;
  private supabase: any;

  constructor(organizationId: string, integrationId: string, supabase: any) {
    this.organizationId = organizationId;
    this.integrationId = integrationId;
    this.supabase = supabase;
  }

  private async getStoredTokens(): Promise<SensorPushTokens | null> {
    const { data, error } = await this.supabase
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

    await this.supabase
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
    // First try to get stored valid tokens
    const storedTokens = await this.getStoredTokens();
    if (storedTokens) {
      return storedTokens.accesstoken;
    }

    // Get credentials from database
    const { data: integration, error } = await this.supabase
      .from("sensorpush_integrations")
      .select("email, password_hash")
      .eq("id", this.integrationId)
      .eq("organization_id", this.organizationId)
      .single();

    if (error || !integration) {
      throw new Error("SensorPush integration not found");
    }

    // Step 1: Get authorization code
    const authResponse = await fetch(
      `${SensorPushAPI.BASE_URL}/oauth/authorize`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: integration.email,
          password: integration.password_hash,
        }),
      },
    );

    if (!authResponse.ok) {
      throw new Error("Failed to authenticate with SensorPush");
    }

    const authData = await authResponse.json();
    const authorization = authData.authorization;

    // Step 2: Get access token
    const tokenResponse = await fetch(
      `${SensorPushAPI.BASE_URL}/oauth/accesstoken`,
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
      throw new Error("Failed to get access token from SensorPush");
    }

    const tokenData = await tokenResponse.json();
    const tokens = { accesstoken: tokenData.accesstoken };

    // Store tokens for future use
    await this.storeTokens(tokens);

    return tokens.accesstoken;
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

    const response = await fetch(`${SensorPushAPI.BASE_URL}/samples`, {
      method: "POST",
      headers: {
        accept: "application/json",
        Authorization: accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch samples from SensorPush");
    }

    return await response.json();
  }

  async syncReadingsToDatabase(startTime?: string): Promise<number> {
    try {
      const options: any = {
        limit: 10000,
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
        options.startTime = startTime;
      } else {
        // Get the last reading time from database
        const { data: lastReading } = await this.supabase
          .from("sensorpush_readings")
          .select("observed_at")
          .eq("organization_id", this.organizationId)
          .order("observed_at", { ascending: false })
          .limit(1)
          .single();

        if (lastReading) {
          options.startTime = lastReading.observed_at;
        }
      }

      const samplesData = await this.getSamples(options);

      // Insert readings into database
      const readings = [];
      for (const [sensorId, samples] of Object.entries(samplesData.sensors)) {
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

      if (readings.length > 0) {
        const { error } = await this.supabase
          .from("sensorpush_readings")
          .insert(readings);

        if (error) {
          throw error;
        }
      }

      // Update last sync time
      await this.supabase
        .from("sensorpush_integrations")
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", this.integrationId);

      return readings.length;
    } catch (error) {
      console.error("Error syncing SensorPush readings:", error);
      throw error;
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Get all active SensorPush integrations
    const { data: integrations, error: integrationsError } =
      await supabaseClient
        .from("sensorpush_integrations")
        .select("id, organization_id, email")
        .eq("is_active", true);

    if (integrationsError) {
      throw integrationsError;
    }

    const results = [];

    // Sync data for each integration
    for (const integration of integrations || []) {
      try {
        const api = new SensorPushAPI(
          integration.organization_id,
          integration.id,
          supabaseClient,
        );

        const readingsCount = await api.syncReadingsToDatabase();

        results.push({
          organization_id: integration.organization_id,
          integration_id: integration.id,
          readings_synced: readingsCount,
          status: "success",
        });

        console.log(
          `Synced ${readingsCount} readings for organization ${integration.organization_id}`,
        );
      } catch (error) {
        console.error(
          `Error syncing for organization ${integration.organization_id}:`,
          error,
        );
        results.push({
          organization_id: integration.organization_id,
          integration_id: integration.id,
          error: error.message,
          status: "error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${integrations?.length || 0} integrations`,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in sync-sensorpush function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
