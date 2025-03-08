import axios from "axios";

const API_BASE = "https://api.7shifts.com/v2";
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export interface Shift {
  id: number;
  location_id: number;
  user_id: number;
  department_id: number;
  role_id: number;
  start: Date;
  end: Date;
  notes: string;
  user: {
    name: string;
  };
  role: {
    name: string;
  };
}

interface ConnectionParams {
  accessToken: string;
  companyId: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}

// Helper to build proxied URL
const getProxiedUrl = (path: string) => {
  const url = `${API_BASE}${path}`;
  return import.meta.env.PROD ? url : `${CORS_PROXY}${encodeURIComponent(url)}`;
};

export async function getShifts({
  accessToken,
  companyId,
  locationId,
  startDate,
  endDate,
}: ConnectionParams): Promise<Shift[]> {
  try {
    const url = getProxiedUrl(`/company/${companyId}/shifts`);

    // Build query parameters
    const params: Record<string, any> = {
      limit: 250,
      deleted: false,
      draft: false,
      published: true, // Only get published shifts
    };

    // Add date range if provided
    if (startDate) {
      params["start[gte]"] = `${startDate}T00:00:00Z`;
    }

    if (endDate) {
      params["start[lte]"] = `${endDate}T23:59:59Z`;
    }

    // Add location filter if provided
    if (locationId) {
      params.location_id = locationId;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params,
    });

    // Transform dates from strings to Date objects
    return (response.data?.data || []).map((shift: any) => ({
      ...shift,
      start: new Date(shift.start),
      end: new Date(shift.end),
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Failed to fetch shifts:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.message || "Failed to fetch shifts",
      );
    }
    throw error;
  }
}

export async function testConnection({
  accessToken,
  companyId,
}: ConnectionParams): Promise<boolean> {
  try {
    const url = getProxiedUrl(`/company/${companyId}`);
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Connection test failed:",
        error.response?.data || error.message,
      );
    } else {
      console.error("Connection test failed:", error);
    }
    return false;
  }
}

/**
 * Fetch schedule data from 7shifts API
 * @param config API configuration
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 * @returns Promise resolving to schedule data
 */
export const fetchSchedule = async (
  config: { apiKey: string; locationId?: string },
  startDate: string,
  endDate: string,
) => {
  if (!config.apiKey) {
    throw new Error("7shifts API key is required");
  }

  // Use v2 API for better compatibility
  const baseUrl = "https://api.7shifts.com/v2";
  let url = `${baseUrl}/shifts?limit=250`;

  // Add date filters
  if (startDate) {
    url += `&start[gte]=${startDate}T00:00:00Z`;
  }

  if (endDate) {
    url += `&start[lte]=${endDate}T23:59:59Z`;
  }

  // Add location filter if provided
  if (config.locationId) {
    url += `&location_id=${config.locationId}`;
  }

  // Add published filter to only get published shifts
  url += "&published=true";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `7shifts API error: ${errorData.message || response.statusText}`,
      );
    }

    const responseData = await response.json();
    return {
      shifts: responseData.data || [],
      meta: responseData.meta || {},
    };
  } catch (error) {
    console.error("Error fetching 7shifts schedule:", error);
    throw error;
  }
};
