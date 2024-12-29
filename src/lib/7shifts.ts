import axios from 'axios';

const API_BASE = 'https://api.7shifts.com/v2';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

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
}

// Helper to build proxied URL
const getProxiedUrl = (path: string) => {
  const url = `${API_BASE}${path}`;
  return import.meta.env.PROD ? url : `${CORS_PROXY}${encodeURIComponent(url)}`;
};

export async function getShifts({ accessToken, companyId }: ConnectionParams): Promise<Shift[]> {
  try {
    const url = getProxiedUrl(`/company/${companyId}/shifts`);
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      params: {
        limit: 100,
        deleted: false,
        draft: false
      }
    });

    // Transform dates from strings to Date objects
    return (response.data?.data || []).map((shift: any) => ({
      ...shift,
      start: new Date(shift.start),
      end: new Date(shift.end)
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Failed to fetch shifts:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch shifts');
    }
    throw error;
  }
}

export async function testConnection({ accessToken, companyId }: ConnectionParams): Promise<boolean> {
  try {
    const url = getProxiedUrl(`/company/${companyId}`);
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Connection test failed:', error.response?.data || error.message);
    } else {
      console.error('Connection test failed:', error);
    }
    return false;
  }
}