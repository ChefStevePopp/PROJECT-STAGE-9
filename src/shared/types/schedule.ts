export interface Shift {
  id: number;
  employeeName: string;
  role: string;
  start: Date;
  end: Date;
  notes?: string;
  location: string;
}

export interface ShiftEvent {
  id: string;
  employeeName: string;
  role: string;
  start: Date;
  end: Date;
  notes: string;
  location: string;
}

export interface ScheduleStore {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
  lastSync: string | null;
  accessToken: string;
  companyId: string;
  locationId: string;
  calendarUrl: string | null;
  syncSchedule: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  setAccessToken: (token: string) => void;
  setCredentials: (credentials: { accessToken: string; companyId: string; locationId: string }) => void;
}