import { Database } from "./supabase";

export type CSVMapping = Database["public"]["Tables"]["csv_mappings"]["Row"];

export interface ColumnMapping {
  id: string;
  name: string;
  format: "standard" | "weekly" | "custom";
  employeeNameField: string;
  roleField?: string;
  dateField?: string;
  startTimeField?: string;
  endTimeField?: string;
  breakDurationField?: string;
  notesField?: string;
  // For weekly format
  mondayField?: string;
  tuesdayField?: string;
  wednesdayField?: string;
  thursdayField?: string;
  fridayField?: string;
  saturdayField?: string;
  sundayField?: string;
  // For time parsing
  timeFormat?: string;
  rolePattern?: string;
}
