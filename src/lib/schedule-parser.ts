/**
 * Schedule Parser Utility
 *
 * This utility helps parse different schedule file formats into a standardized format
 * for the application. It currently supports CSV files and 7shifts API data.
 */

import Papa from "papaparse";

interface ScheduleShift {
  employee_id: string;
  employee_name: string;
  role: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  notes?: string;
}

/**
 * Parse a CSV file containing schedule data
 * @param file The CSV file to parse
 * @returns Promise resolving to an array of standardized shift objects
 */
export const parseScheduleCsv = (file: File): Promise<ScheduleShift[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(`CSV parsing error: ${results.errors[0].message}`);
          }

          // More flexible format detection - just try to map the data we have
          const shifts = transformCsvData(results.data);
          resolve(shifts);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
};

/**
 * Transform CSV data into standardized shift objects regardless of format
 * @param data The parsed CSV data
 * @returns Array of standardized shift objects
 */
const transformCsvData = (data: any[]): ScheduleShift[] => {
  if (!data || data.length === 0) {
    throw new Error("Empty or invalid CSV data");
  }

  return data.map((row) => {
    // Try to find the appropriate fields by checking multiple possible names
    const employeeName = findFieldValue(row, [
      "Employee",
      "employee",
      "Name",
      "name",
      "Staff",
      "staff",
      "Employee Name",
      "employee_name",
    ]);

    const role = findFieldValue(row, [
      "Position",
      "position",
      "Role",
      "role",
      "Job",
      "job",
      "Title",
      "title",
    ]);

    const date = findFieldValue(row, [
      "Date",
      "date",
      "Day",
      "day",
      "Shift Date",
      "shift_date",
      "ShiftDate",
    ]);

    const startTime = findFieldValue(row, [
      "Start Time",
      "start_time",
      "Start",
      "start",
      "In",
      "in",
      "Clock In",
      "clock_in",
    ]);

    const endTime = findFieldValue(row, [
      "End Time",
      "end_time",
      "End",
      "end",
      "Out",
      "out",
      "Clock Out",
      "clock_out",
    ]);

    const breakDuration = findFieldValue(row, [
      "Break Duration",
      "break_duration",
      "Break",
      "break",
      "Break Length",
      "break_length",
    ]);

    const notes = findFieldValue(row, [
      "Notes",
      "notes",
      "Comments",
      "comments",
      "Description",
      "description",
    ]);

    const employeeId = findFieldValue(row, [
      "Employee ID",
      "employee_id",
      "EmployeeID",
      "ID",
      "id",
      "User ID",
      "user_id",
    ]);

    if (!employeeName || !date || !startTime || !endTime) {
      console.warn("Missing required fields in row:", row);
    }

    return {
      employee_id: employeeId || "",
      employee_name: employeeName || "Unknown Employee",
      role: role || "",
      date: date || new Date().toISOString().split("T")[0],
      start_time: startTime || "00:00",
      end_time: endTime || "00:00",
      break_duration: parseFloat(breakDuration || "0"),
      notes: notes || "",
    };
  });
};

/**
 * Find a value in an object by checking multiple possible field names
 * @param obj The object to search in
 * @param possibleNames Array of possible field names
 * @returns The value if found, or empty string if not found
 */
const findFieldValue = (obj: any, possibleNames: string[]): string => {
  for (const name of possibleNames) {
    if (obj[name] !== undefined) {
      return obj[name];
    }
  }
  return "";
};

/**
 * Parse 7shifts API data into standardized shift objects
 * @param apiData The data from the 7shifts API
 * @returns Array of standardized shift objects
 */
export const parse7shiftsApiData = (apiData: any): ScheduleShift[] => {
  if (!apiData || !apiData.shifts || !Array.isArray(apiData.shifts)) {
    throw new Error("Invalid 7shifts API data format");
  }

  return apiData.shifts.map((shift: any) => ({
    employee_id: shift.user_id?.toString() || "",
    employee_name: shift.user?.name || "",
    role: shift.role?.name || "",
    date: shift.date || "",
    start_time: shift.start_time || "",
    end_time: shift.end_time || "",
    break_duration: shift.break_time || 0,
    notes: shift.notes || "",
  }));
};

/**
 * Group shifts by date for calendar view
 * @param shifts Array of shift objects
 * @returns Object with dates as keys and arrays of shifts as values
 */
export const groupShiftsByDate = (
  shifts: ScheduleShift[],
): Record<string, ScheduleShift[]> => {
  return shifts.reduce(
    (grouped, shift) => {
      const date = shift.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(shift);
      return grouped;
    },
    {} as Record<string, ScheduleShift[]>,
  );
};

/**
 * Format a date string to a standardized format (YYYY-MM-DD)
 * @param dateStr The date string to format
 * @returns Formatted date string
 */
export const formatDateString = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr; // Return original if parsing fails
  }
};
