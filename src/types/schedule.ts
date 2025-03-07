export interface Schedule {
  id: string;
  organization_id: string;
  start_date: string;
  end_date: string;
  file_url?: string;
  status: "current" | "upcoming" | "previous";
  created_at: string;
  created_by: string;
  source: "csv" | "7shifts" | "manual";
  metadata?: Record<string, any>;
}

export interface ScheduleShift {
  id: string;
  schedule_id: string;
  employee_id?: string;
  employee_name: string; // Keeping for backward compatibility
  first_name?: string;
  last_name?: string;
  role?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  notes?: string;
  created_at?: string;
}

export interface SevenShiftsIntegration {
  id: string;
  organization_id: string;
  api_key: string;
  location_id?: string;
  auto_sync: boolean;
  sync_frequency: "daily" | "weekly" | "manual";
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ScheduleUploadOptions {
  startDate: string;
  endDate: string;
  source: "csv" | "7shifts" | "manual";
  activateImmediately?: boolean;
  selectedMapping?: any;
}

export interface ScheduleDay {
  date: string;
  dayOfWeek: string;
  shifts: ScheduleShift[];
  isToday?: boolean;
  isWeekend?: boolean;
}

export interface WeeklySchedule {
  startDate: string;
  endDate: string;
  days: ScheduleDay[];
  totalHours: number;
  employeeCount: number;
}
