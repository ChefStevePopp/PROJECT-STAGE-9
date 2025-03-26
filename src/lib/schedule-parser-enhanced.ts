/**
 * Enhanced Schedule Parser Utility
 *
 * This utility helps parse different schedule file formats into a standardized format
 * for the application. It supports multiple formats including:
 * - Standard CSV with date, start_time, end_time columns
 * - Weekly format with days of week as columns
 * - Custom mappings defined by users
 */

import Papa from "papaparse";
import { format, parse, addDays, startOfWeek } from "date-fns";
import type { ColumnMapping } from "@/features/admin/components/sections/ScheduleManager/components/CSVConfiguration";

export interface ScheduleShift {
  employee_id?: string;
  employee_name: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  date: string;
  shift_date: string; // Explicitly add shift_date to match database schema
  start_time: string;
  end_time: string;
  break_duration: number;
  notes?: string;
  punch_id?: string; // Added field for punch_id from CSV
}

/**
 * Parse a CSV file using a specific column mapping
 * @param file The CSV file to parse
 * @param mapping The column mapping to use
 * @param startDate The start date for weekly format (to determine actual dates)
 * @returns Promise resolving to an array of standardized shift objects
 */
export const parseScheduleCsvWithMapping = (
  file: File,
  mapping: ColumnMapping,
  startDate?: string,
): Promise<ScheduleShift[]> => {
  console.log("Parsing CSV with mapping:", mapping);
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            throw new Error(`CSV parsing error: ${results.errors[0].message}`);
          }

          let shifts: ScheduleShift[] = [];

          if (mapping.format === "standard") {
            shifts = parseStandardFormat(results.data, mapping);
          } else if (mapping.format === "weekly") {
            shifts = parseWeeklyFormat(results.data, mapping, startDate);
          } else {
            // Custom format - try to be flexible
            if (hasWeeklyFields(mapping)) {
              shifts = parseWeeklyFormat(results.data, mapping, startDate);
            } else {
              shifts = parseStandardFormat(results.data, mapping);
            }
          }

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
 * Check if mapping has weekly fields defined
 */
const hasWeeklyFields = (mapping: ColumnMapping): boolean => {
  return [
    mapping.mondayField,
    mapping.tuesdayField,
    mapping.wednesdayField,
    mapping.thursdayField,
    mapping.fridayField,
    mapping.saturdayField,
    mapping.sundayField,
  ].some(Boolean);
};

/**
 * Parse CSV data in standard format (with date, start_time, end_time columns)
 */
const parseStandardFormat = (
  data: any[],
  mapping: ColumnMapping,
): ScheduleShift[] => {
  if (!data || data.length === 0) {
    throw new Error("Empty or invalid CSV data");
  }

  if (
    !mapping.employeeNameField ||
    !mapping.dateField ||
    !mapping.startTimeField ||
    !mapping.endTimeField
  ) {
    throw new Error("Missing required field mappings for standard format");
  }

  return data
    .map((row) => {
      // Skip rows with empty required fields
      if (
        !row[mapping.employeeNameField] ||
        !row[mapping.startTimeField] ||
        !row[mapping.endTimeField]
      ) {
        console.warn("Skipping row with missing required fields:", row);
        return null;
      }

      const fullName = row[mapping.employeeNameField];
      const nameParts = fullName.split(" ");
      const firstName =
        nameParts.length > 1
          ? nameParts.slice(0, -1).join(" ")
          : nameParts[0] || "";
      const lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      // Get employee ID from standard fields if available
      const employeeId = row["employee_id"] || row["Employee ID"] || "";

      // Format the date and ensure it's not null
      const formattedDate = row[mapping.dateField]
        ? formatDateString(row[mapping.dateField])
        : new Date().toISOString().split("T")[0];

      // Log the date processing for debugging
      console.log(`Processing date for ${fullName}:`, {
        originalDate: row[mapping.dateField],
        formattedDate: formattedDate,
      });

      return {
        employee_id: employeeId,
        punch_id: employeeId, // Store as punch_id as well for matching
        employee_name: fullName,
        first_name: firstName,
        last_name: lastName,
        role: mapping.roleField ? row[mapping.roleField] : "",
        date: formattedDate, // Use the safely formatted date
        shift_date: formattedDate, // Ensure shift_date is set to match the date field
        start_time: formatTimeString(row[mapping.startTimeField]),
        end_time: formatTimeString(row[mapping.endTimeField]),
        break_duration: mapping.breakDurationField
          ? parseFloat(row[mapping.breakDurationField] || "0")
          : 0,
        notes: mapping.notesField ? row[mapping.notesField] : "",
      };
    })
    .filter(Boolean) as ScheduleShift[];
};

/**
 * Parse CSV data in weekly format (with days of week as columns)
 */
const parseWeeklyFormat = (
  data: any[],
  mapping: ColumnMapping,
  startDateStr?: string,
): ScheduleShift[] => {
  if (!data || data.length === 0) {
    throw new Error("Empty or invalid CSV data");
  }

  if (!mapping.employeeNameField) {
    throw new Error("Missing employee name field mapping for weekly format");
  }

  // Determine the start of the week
  let weekStart: Date;
  if (startDateStr) {
    weekStart = parse(startDateStr, "yyyy-MM-dd", new Date());
  } else {
    // Default to current week's Monday
    weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  }

  const shifts: ScheduleShift[] = [];

  // Map of day field names to day indices (0 = Monday, 6 = Sunday)
  const dayFieldMap: Record<keyof ColumnMapping, number> = {
    mondayField: 0,
    tuesdayField: 1,
    wednesdayField: 2,
    thursdayField: 3,
    fridayField: 4,
    saturdayField: 5,
    sundayField: 6,
  };

  // Process each employee row
  data.forEach((row) => {
    const employeeName = row[mapping.employeeNameField];
    if (!employeeName) {
      console.warn("Skipping row with missing employee name:", row);
      return;
    }

    // Debug log to see what we're working with
    console.log("Processing row:", employeeName, row);

    // Process each day of the week
    Object.entries(dayFieldMap).forEach(([fieldName, dayIndex]) => {
      const mappingKey = fieldName as keyof ColumnMapping;
      const dayField = mapping[mappingKey];

      if (!dayField || !row[dayField]) return; // Skip if no mapping or empty shift

      const shiftText = row[dayField];
      if (shiftText.toLowerCase() === "off") return; // Skip "off" days

      // Parse the shift text (e.g., "10am - 6pm (COLD PREP)")
      // Skip empty cells or "off" shifts
      if (!shiftText || shiftText.toLowerCase() === "off" || shiftText === "")
        return;

      try {
        const { startTime, endTime, role } = parseShiftText(shiftText);
        if (!startTime || !endTime) {
          console.warn("Could not parse shift time from text:", shiftText);
          return; // Skip if we couldn't parse times
        }

        // Calculate the date for this day
        const shiftDate = addDays(weekStart, dayIndex);
        const dateStr = format(shiftDate, "yyyy-MM-dd");

        const nameParts = employeeName.split(" ");
        const firstName =
          nameParts.length > 1
            ? nameParts.slice(0, -1).join(" ")
            : nameParts[0] || "";
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

        // Get employee ID from standard fields if available
        const employeeId = row["employee_id"] || row["Employee ID"] || "";

        shifts.push({
          employee_name: employeeName,
          first_name: firstName,
          last_name: lastName,
          employee_id: employeeId,
          punch_id: employeeId, // Store as punch_id as well for matching
          role: role || "",
          date: dateStr,
          shift_date: dateStr, // Ensure shift_date is set to match the date field
          start_time: startTime,
          end_time: endTime,
          break_duration: 0, // Default to 0 for weekly format
          notes: "",
        });
      } catch (error) {
        console.error(
          `Error parsing shift for ${employeeName} on day ${dayIndex}:`,
          error,
        );
      }
    });
  });

  // Log the final result for debugging
  console.log(`Generated ${shifts.length} shifts from weekly format`);
  return shifts;
};

/**
 * Parse a shift text string like "10am - 6pm (COLD PREP)"
 */
const parseShiftText = (
  text: string,
): { startTime: string; endTime: string; role?: string } => {
  // Default result
  const result = { startTime: "", endTime: "", role: "" };

  // Skip empty or "off" shifts
  if (!text || text.toLowerCase() === "off" || text === "") {
    return result;
  }

  // Extract role from parentheses if present
  const roleMatch = text.match(/\(([^)]+)\)/);
  if (roleMatch && roleMatch[1]) {
    result.role = roleMatch[1].trim();
  }

  // Remove the role part for cleaner time parsing
  const timeText = text.replace(/\([^)]+\)/g, "").trim();

  // Try to extract times with various formats
  const timeRangePatterns = [
    // 10am - 6pm or 4pm - 10:30pm
    /([0-9]+(?::[0-9]+)?\s*(?:am|pm))\s*-\s*([0-9]+(?::[0-9]+)?\s*(?:am|pm))/i,
    // 10:00 - 18:00
    /([0-9]{1,2}:[0-9]{2})\s*-\s*([0-9]{1,2}:[0-9]{2})/,
    // 10 - 18
    /([0-9]{1,2})\s*-\s*([0-9]{1,2})/,
  ];

  for (const pattern of timeRangePatterns) {
    const match = timeText.match(pattern);
    if (match && match[1] && match[2]) {
      result.startTime = formatTimeString(match[1]);
      result.endTime = formatTimeString(match[2]);
      break;
    }
  }

  return result;
};

/**
 * Format a date string to a standardized format (YYYY-MM-DD)
 */
export const formatDateString = (dateStr: string): string => {
  try {
    // If dateStr is null, undefined or empty, use today's date
    if (!dateStr) {
      console.warn("Empty date string provided, using current date");
      return new Date().toISOString().split("T")[0];
    }

    // Log the input for debugging
    console.log("Formatting date string:", dateStr);

    // Try various date formats
    let date: Date | null = null;

    // Try MM/DD/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try DD/MM/YYYY
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("/");
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    // Try YYYY-MM-DD
    else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
      date = new Date(dateStr);
    }
    // Try Month name formats
    else if (/[A-Za-z]+\s+\d{1,2},?\s+\d{4}/.test(dateStr)) {
      date = new Date(dateStr);
    } else {
      // Last resort, try to parse as is
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
      console.warn(`Invalid date: ${dateStr}, using current date`);
      return new Date().toISOString().split("T")[0];
    }

    const result = date.toISOString().split("T")[0]; // YYYY-MM-DD
    console.log(`Formatted date result: ${result}`);
    return result;
  } catch (error) {
    console.error("Error formatting date:", error);
    console.warn("Using current date as fallback");
    return new Date().toISOString().split("T")[0]; // Use current date as fallback
  }
};

/**
 * Format a time string to a standardized format (HH:MM)
 */
export const formatTimeString = (timeStr: string): string => {
  try {
    timeStr = timeStr.trim().toLowerCase();

    // If already in 24-hour format (13:30)
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
      return timeStr;
    }

    // Handle 12-hour format with am/pm
    if (/([0-9]+)(?::([0-9]+))?\s*(am|pm)/i.test(timeStr)) {
      const match = timeStr.match(/([0-9]+)(?::([0-9]+))?\s*(am|pm)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const isPM = match[3].toLowerCase() === "pm";

        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }
    }

    // Handle simple hour format (e.g., "9" or "14")
    if (/^\d{1,2}$/.test(timeStr)) {
      const hours = parseInt(timeStr);
      return `${hours.toString().padStart(2, "0")}:00`;
    }

    // If we can't parse it, return as is
    return timeStr;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeStr; // Return original if parsing fails
  }
};
