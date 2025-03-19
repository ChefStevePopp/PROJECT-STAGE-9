import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Upload,
  History,
  Link,
  Clock,
  Users,
  FileSpreadsheet,
  RefreshCw,
  Download,
  X,
  Settings,
  Eye,
  Trash,
  AlertTriangle,
} from "lucide-react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useScheduleStore } from "@/stores/scheduleStore";
import { ScheduleShift } from "@/types/schedule";
import {
  CSVConfiguration,
  ColumnMapping,
  TimeFormatToggle,
  EmployeeMatchingModal,
} from "./components";
import { parseScheduleCsvWithMapping } from "@/lib/schedule-parser-enhanced";
import { useScheduleMappingStore } from "@/stores/scheduleMappingStore";
import { MappingManager } from "./components/MappingManager";

// Helper function to format time based on user preference
const formatTime = (timeStr: string, format: "12h" | "24h"): string => {
  if (!timeStr) return "";

  // If already in 12-hour format with am/pm
  if (
    timeStr.toLowerCase().includes("am") ||
    timeStr.toLowerCase().includes("pm")
  ) {
    return format === "12h" ? timeStr : convertTo24Hour(timeStr);
  }

  // If in 24-hour format (HH:MM)
  if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
    return format === "24h" ? timeStr : convertTo12Hour(timeStr);
  }

  // Return as is if we can't determine the format
  return timeStr;
};

// Convert 24-hour format to 12-hour format
const convertTo12Hour = (time24: string): string => {
  const [hourStr, minute] = time24.split(":");
  const hour = parseInt(hourStr, 10);

  if (hour === 0) {
    return `12:${minute} AM`;
  } else if (hour < 12) {
    return `${hour}:${minute} AM`;
  } else if (hour === 12) {
    return `12:${minute} PM`;
  } else {
    return `${hour - 12}:${minute} PM`;
  }
};

// Convert 12-hour format to 24-hour format
const convertTo24Hour = (time12: string): string => {
  const [timePart, meridiem] = time12.toLowerCase().split(/(am|pm)/);
  let [hourStr, minute] = timePart.trim().split(":");
  let hour = parseInt(hourStr, 10);

  if (meridiem.includes("pm") && hour < 12) {
    hour += 12;
  } else if (meridiem.includes("am") && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, "0")}:${minute}`;
};

export const ScheduleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "current" | "upcoming" | "previous" | "integration" | "config"
  >("current");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEmployeeMatchingModalOpen, setIsEmployeeMatchingModalOpen] =
    useState(false);
  const [parsedShifts, setParsedShifts] = useState<any[]>([]);
  const [employeeMatches, setEmployeeMatches] = useState<{
    [key: string]: any;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any | null>(null);
  const [activateImmediately, setActivateImmediately] = useState(false);
  const [showCSVConfig, setShowCSVConfig] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<ColumnMapping | null>(
    null,
  );
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 6); // 7 days total (today + 6)
    return date.toISOString().split("T")[0];
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [sevenShiftsApiKey, setSevenShiftsApiKey] = useState("");
  const [sevenShiftsLocationId, setSevenShiftsLocationId] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [notifyChanges, setNotifyChanges] = useState(false);
  const [syncStartDate, setSyncStartDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [syncEndDate, setSyncEndDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 13); // 14 days total (today + 13)
    return date.toISOString().split("T")[0];
  });
  // Track if we've already fetched the current schedule to prevent multiple refreshes
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Get the schedule functions and state from the store
  const {
    uploadSchedule,
    fetchCurrentSchedule,
    fetchUpcomingSchedule,
    fetchShifts,
    currentSchedule,
    scheduleShifts,
    isLoading,
    error: scheduleError,
    testConnection,
    sync7shiftsSchedule,
  } = useScheduleStore();

  // Get the mapping store functions
  const { mappings, fetchMappings } = useScheduleMappingStore();

  // Load saved mappings from the store on component mount
  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  // Parse CSV file
  const parseCSVFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.error("Error parsing CSV:", results.errors);
          toast.error("Error parsing CSV file");
          return;
        }

        // Set the parsed data
        setPreviewData(results.data);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        toast.error("Failed to parse CSV file");
      },
    });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCSVFile(file);
    }
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCsvFile(file);
      parseCSVFile(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Save a column mapping
  const handleSaveMapping = (mapping: ColumnMapping) => {
    // Use the store to save the mapping
    useScheduleMappingStore
      .getState()
      .saveMapping(mapping)
      .then(() => {
        setSelectedMapping(mapping);
        setShowCSVConfig(false);
        toast.success("Mapping saved successfully");
      })
      .catch((error) => {
        console.error("Error saving mapping:", error);
        toast.error("Failed to save mapping");
      });
  };

  // Handle upload
  const handleUpload = async () => {
    if (!csvFile) return;

    setIsUploading(true);
    try {
      let shifts;

      // If we have a selected mapping, use it to parse the CSV
      if (selectedMapping) {
        shifts = await parseScheduleCsvWithMapping(
          csvFile,
          selectedMapping,
          startDate,
        );
      } else {
        // Otherwise, use the default parser
        shifts = [];
        toast.error("Please select or create a CSV mapping first");
        setIsUploading(false);
        return;
      }

      if (shifts.length === 0) {
        toast.error("No valid shifts found in the CSV file");
        setIsUploading(false);
        return;
      }

      console.log(`Found ${shifts.length} shifts in the uploaded file`);

      // Close the upload modal first, then show the employee matching modal
      setIsUploadModalOpen(false);
      setParsedShifts(shifts);
      setIsEmployeeMatchingModalOpen(true);
      return; // Stop here and wait for employee matching
    } catch (error) {
      console.error("Error uploading schedule:", error);
      toast.error(scheduleError || "Failed to upload schedule");
    } finally {
      setIsUploading(false);
    }
  };

  // Export schedule to CSV
  const exportScheduleToCSV = async (scheduleId: string) => {
    try {
      // Fetch the shifts for this schedule if not already loaded
      if (selectedScheduleId !== scheduleId) {
        await fetchShifts(scheduleId);
        setSelectedScheduleId(scheduleId);
      }

      // Get the shifts from the store
      const shifts = useScheduleStore.getState().scheduleShifts;

      if (shifts.length === 0) {
        toast.error("No shifts found to export");
        return;
      }

      // Convert shifts to CSV format
      const csvData = shifts.map((shift) => ({
        "Employee Name":
          `${shift.first_name || ""} ${shift.last_name || ""}`.trim() ||
          shift.employee_name,
        Role: shift.role || "",
        Date: shift.shift_date,
        "Start Time": shift.start_time,
        "End Time": shift.end_time,
        "Break Duration": shift.break_duration || 0,
        Notes: shift.notes || "",
      }));

      // Use PapaParse to convert to CSV string
      const csv = Papa.unparse(csvData);

      // Create a blob and download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Find the schedule to get date info for the filename
      const schedule = useScheduleStore
        .getState()
        .previousSchedules.find((s) => s.id === scheduleId);
      const filename = schedule
        ? `schedule_${schedule.start_date}_to_${schedule.end_date}.csv`
        : `schedule_export_${new Date().toISOString().split("T")[0]}.csv`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Schedule exported successfully");
    } catch (error) {
      console.error("Error exporting schedule:", error);
      toast.error("Failed to export schedule");
    }
  };

  // Handle 7shifts connection test
  const handleTestConnection = async () => {
    if (!sevenShiftsApiKey || !sevenShiftsLocationId) {
      toast.error("Please enter both API key and location ID");
      return;
    }

    setIsConnecting(true);
    try {
      // Set credentials in the store
      useScheduleStore.getState().setCredentials({
        accessToken: sevenShiftsApiKey,
        companyId: "7140", // Default company ID
        locationId: sevenShiftsLocationId,
      });

      // Test the connection
      const success = await testConnection();

      if (success) {
        toast.success("Connection successful!");
        setIsConnected(true);
      } else {
        toast.error("Connection failed. Please check your credentials.");
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Connection test error:", error);
      toast.error("Error testing connection");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle 7shifts sync
  const handleSync7shifts = async () => {
    if (!sevenShiftsApiKey || !sevenShiftsLocationId) {
      toast.error("Please enter both API key and location ID");
      return;
    }

    if (!syncStartDate || !syncEndDate) {
      toast.error("Please select a date range");
      return;
    }

    setIsConnecting(true);
    try {
      // First set the credentials
      useScheduleStore.getState().setCredentials({
        accessToken: sevenShiftsApiKey,
        companyId: "7140", // Default company ID
        locationId: sevenShiftsLocationId,
      });

      // Try to sync directly first to test the API
      const shifts = await useScheduleStore
        .getState()
        .syncSchedule(syncStartDate, syncEndDate);

      if (shifts && shifts.length > 0) {
        // If we got shifts, now use the sync7shiftsSchedule to save them to the database
        await sync7shiftsSchedule(
          sevenShiftsApiKey,
          sevenShiftsLocationId,
          syncStartDate,
          syncEndDate,
        );
        toast.success(
          `Schedule synced successfully with ${shifts.length} shifts!`,
        );
      } else {
        toast.warning("No shifts found in the selected date range");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(scheduleError || "Error syncing schedule");
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle saving 7shifts settings
  const handleSaveSettings = () => {
    // Save settings to localStorage or database
    localStorage.setItem(
      "7shifts-settings",
      JSON.stringify({
        apiKey: sevenShiftsApiKey,
        locationId: sevenShiftsLocationId,
        autoSync,
        notifyChanges,
      }),
    );
    toast.success("Settings saved successfully");
  };

  // Load 7shifts settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("7shifts-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setSevenShiftsApiKey(settings.apiKey || "");
        setSevenShiftsLocationId(settings.locationId || "");
        setAutoSync(settings.autoSync || false);
        setNotifyChanges(settings.notifyChanges || false);

        // If we have credentials, check connection status
        if (settings.apiKey && settings.locationId) {
          useScheduleStore.getState().setCredentials({
            accessToken: settings.apiKey,
            companyId: "7140",
            locationId: settings.locationId,
          });
          testConnection().then((success) => {
            setIsConnected(success);
          });
        }
      } catch (error) {
        console.error("Error loading 7shifts settings:", error);
      }
    }
  }, []);

  // Handle activating the upcoming schedule
  const handleActivateUpcoming = async () => {
    if (!upcomingSchedule?.id) return;

    setIsUploading(true);
    try {
      // Call the actual activate function from the store
      await useScheduleStore.getState().activateSchedule(upcomingSchedule.id);

      // Refresh the schedule data
      await fetchCurrentSchedule();
      await fetchUpcomingSchedule();

      toast.success("Schedule activated successfully");
      setUpcomingSchedule(null);
    } catch (error) {
      console.error("Error activating schedule:", error);
      toast.error(scheduleError || "Failed to activate schedule");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch current schedule when component mounts - only once
  useEffect(() => {
    if (!initialFetchDone) {
      const fetchCurrentScheduleData = async () => {
        const result = await fetchCurrentSchedule();
        // Get the latest currentSchedule from the store after fetching
        const latestSchedule = useScheduleStore.getState().currentSchedule;
        if (latestSchedule?.id) {
          await fetchShifts(latestSchedule.id);
        }
        setInitialFetchDone(true);
      };
      fetchCurrentScheduleData();
    }
  }, [initialFetchDone]);

  // Fetch data when tab changes
  useEffect(() => {
    // Skip the initial fetch for the current tab since we already did it in the mount effect
    if (activeTab === "current" && initialFetchDone) {
      // Only fetch if we're switching back to this tab, not on initial load
      const fetchCurrentScheduleData = async () => {
        const result = await fetchCurrentSchedule();
        // Get the latest currentSchedule from the store after fetching
        const latestSchedule = useScheduleStore.getState().currentSchedule;
        if (latestSchedule?.id) {
          await fetchShifts(latestSchedule.id);
        }
      };
      fetchCurrentScheduleData();
    } else if (activeTab === "upcoming") {
      fetchUpcomingSchedule();
    } else if (activeTab === "previous") {
      // Fetch previous schedules when the tab is selected
      const { fetchPreviousSchedules } = useScheduleStore.getState();
      fetchPreviousSchedules();
    } else if (activeTab === "config") {
      // Fetch mappings when the config tab is selected
      fetchMappings();
    }
  }, [activeTab, initialFetchDone]);

  // Process shifts to organize them by day
  const days = useMemo(() => {
    if (!currentSchedule) {
      // Return empty days for the week
      return Array(7)
        .fill(null)
        .map((_, i) => ({
          date: "",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ][i],
          shifts: [],
        }));
    }

    // Group shifts by date
    const shiftsByDate = scheduleShifts.reduce(
      (acc, shift) => {
        if (!acc[shift.shift_date]) {
          acc[shift.shift_date] = [];
        }
        acc[shift.shift_date].push(shift);
        return acc;
      },
      {} as Record<string, ScheduleShift[]>,
    );

    // Create array of days
    const startDate = new Date(currentSchedule.start_date);
    return Array(7)
      .fill(null)
      .map((_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        return {
          date: dateStr,
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ][i],
          shifts: shiftsByDate[dateStr] || [],
        };
      });
  }, [currentSchedule, scheduleShifts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Schedule Manager
          </h1>
          <p className="text-gray-400">Upload and manage employee schedules</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 overflow-visible">
        <button
          onClick={() => setActiveTab("current")}
          className={`tab primary whitespace-nowrap ${activeTab === "current" ? "active" : ""}`}
        >
          <Calendar
            className={`w-5 h-5 mr-2 flex-shrink-0 ${activeTab === "current" ? "text-primary-400" : ""}`}
          />
          <span>Current Schedule</span>
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`tab green whitespace-nowrap ${activeTab === "upcoming" ? "active" : ""}`}
        >
          <Clock
            className={`w-5 h-5 mr-2 flex-shrink-0 ${activeTab === "upcoming" ? "text-green-400" : ""}`}
          />
          <span>Upcoming Schedules</span>
        </button>
        <button
          onClick={() => setActiveTab("previous")}
          className={`tab amber whitespace-nowrap ${activeTab === "previous" ? "active" : ""}`}
        >
          <History
            className={`w-5 h-5 mr-2 flex-shrink-0 ${activeTab === "previous" ? "text-amber-400" : ""}`}
          />
          <span>Previous Schedules</span>
        </button>
        <button
          onClick={() => setActiveTab("integration")}
          className={`tab rose whitespace-nowrap ${activeTab === "integration" ? "active" : ""}`}
        >
          <Link
            className={`w-5 h-5 mr-2 flex-shrink-0 ${activeTab === "integration" ? "text-rose-400" : ""}`}
          />
          <span>7shifts Integration</span>
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`tab purple whitespace-nowrap ${activeTab === "config" ? "active" : ""}`}
        >
          <Settings
            className={`w-5 h-5 mr-2 flex-shrink-0 ${activeTab === "config" ? "text-purple-400" : ""}`}
          />
          <span>CSV Configuration</span>
        </button>
      </div>

      {/* Current Schedule Tab */}
      {activeTab === "current" && (
        <div className="space-y-6">
          {/* Current Schedule Card */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">
                  Current Schedule
                </h2>
                <p className="text-sm text-gray-400">
                  {currentSchedule
                    ? `Week of ${currentSchedule.start_date} - ${currentSchedule.end_date}`
                    : "No active schedule"}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <TimeFormatToggle
                  timeFormat={timeFormat}
                  onChange={setTimeFormat}
                />
                <button className="btn-ghost">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
                {currentSchedule && (
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="btn-ghost text-rose-400 hover:text-rose-300"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Schedule
                  </button>
                )}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="btn-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Schedule
                </button>
              </div>
            </div>

            {/* Schedule Calendar View */}
            <div className="bg-gray-800/50 rounded-lg p-6 min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                </div>
              ) : !currentSchedule ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <Calendar className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">No active schedule found</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn-primary"
                  >
                    Upload Schedule
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, index) => (
                    <div
                      key={`day-${index}-${day.date}`}
                      className="text-center"
                    >
                      <div className="font-medium text-gray-300 mb-2">
                        {day.dayOfWeek}
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-3 min-h-[300px] overflow-y-auto">
                        {day.shifts.length > 0 ? (
                          <div className="space-y-2">
                            {day.shifts.map((shift) => {
                              // Generate a consistent color for each role
                              const roleHash = shift.role
                                ? shift.role
                                    .split("")
                                    .reduce(
                                      (acc, char) => acc + char.charCodeAt(0),
                                      0,
                                    )
                                : 0;

                              // Use colors from our theme palette
                              const roleColors = [
                                "text-primary-400",
                                "text-green-400",
                                "text-amber-400",
                                "text-rose-400",
                                "text-purple-400",
                                "text-blue-400",
                              ];
                              const roleColor =
                                roleColors[roleHash % roleColors.length];

                              return (
                                <div
                                  key={shift.id}
                                  className="text-xs bg-gray-600/50 p-2 rounded text-left flex items-center gap-2"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-white truncate">
                                      {shift.employee_name}
                                    </div>
                                    {shift.role && (
                                      <div
                                        className={`${roleColor} text-[10px] uppercase font-medium`}
                                      >
                                        {shift.role}
                                      </div>
                                    )}
                                    <div className="text-gray-300 mt-1">
                                      {formatTime(shift.start_time, timeFormat)}{" "}
                                      - {formatTime(shift.end_time, timeFormat)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            No shifts scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Schedules Tab */}
      {activeTab === "upcoming" && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                Upcoming Schedules
              </h2>
              <p className="text-sm text-gray-400">
                View and manage upcoming schedules
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Schedule
              </button>
            </div>
          </div>

          {/* Upcoming Schedule Card */}
          {upcomingSchedule ? (
            <div className="bg-gray-800/50 rounded-lg p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Week of {upcomingSchedule.start_date} -{" "}
                    {upcomingSchedule.end_date}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Uploaded:{" "}
                    {new Date(upcomingSchedule.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="ml-auto">
                  <button
                    onClick={handleActivateUpcoming}
                    className="btn-primary bg-blue-500 hover:bg-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Activate Now
                  </button>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">
                      Source:{" "}
                      <span className="text-blue-400">
                        {upcomingSchedule.source || "CSV Upload"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This schedule will replace the current schedule when
                      activated.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportScheduleToCSV(upcomingSchedule.id)}
                      className="btn-ghost text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          confirm(
                            "Are you sure you want to delete this upcoming schedule?",
                          )
                        ) {
                          const success = await useScheduleStore
                            .getState()
                            .deleteSchedule(upcomingSchedule.id);

                          if (success) {
                            toast.success(
                              "Upcoming schedule deleted successfully",
                            );
                            fetchUpcomingSchedule();
                          } else {
                            toast.error("Failed to delete upcoming schedule");
                          }
                        }
                      }}
                      className="btn-ghost text-sm text-rose-400 hover:text-rose-300"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800/50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Upcoming Schedules
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Upload a new schedule to have it appear here before activating
                it.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="btn-primary mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Schedule
              </button>
            </div>
          )}
        </div>
      )}

      {/* Previous Schedules Tab */}
      {activeTab === "previous" && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <History className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                Previous Schedules
              </h2>
              <p className="text-sm text-gray-400">
                View and download past schedules
              </p>
            </div>
          </div>

          {/* Previous Schedules List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
              </div>
            ) : useScheduleStore.getState().previousSchedules.length > 0 ? (
              useScheduleStore.getState().previousSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">
                          Week of {schedule.start_date} - {schedule.end_date}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Source: {schedule.source || "CSV Upload"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (schedule.id) {
                            setSelectedScheduleId(schedule.id);
                            await fetchShifts(schedule.id);
                            setIsViewModalOpen(true);
                          }
                        }}
                        className="btn-ghost text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => exportScheduleToCSV(schedule.id)}
                        className="btn-ghost text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Previous Schedules
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  When you upload and activate schedules, they will appear here
                  for future reference.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7shifts Integration Tab */}
      {activeTab === "integration" && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Link className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                7shifts Integration
              </h2>
              <p className="text-sm text-gray-400">
                Connect your 7shifts account to automatically sync schedules
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <img
                    src="https://framerusercontent.com/images/GTwNANjmDcbIsFhKyhhH32pNv4.png?scale-down-to=512"
                    alt="7shifts logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">7shifts</h3>
                  <p className="text-sm text-gray-400">
                    {isConnected ? (
                      <span className="text-green-400">Connected</span>
                    ) : (
                      "Not connected"
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={
                  isConnecting || !sevenShiftsApiKey || !sevenShiftsLocationId
                }
                className="btn-primary bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500"
              >
                {isConnecting
                  ? "Connecting..."
                  : isConnected
                    ? "Test Connection"
                    : "Connect Account"}
              </button>
            </div>
          </div>

          {/* Integration Settings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">
              Integration Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  className="input w-full"
                  placeholder="Enter your 7shifts API key"
                  value={sevenShiftsApiKey}
                  onChange={(e) => setSevenShiftsApiKey(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Location ID
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter your location ID"
                  value={sevenShiftsLocationId}
                  onChange={(e) => setSevenShiftsLocationId(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sync Settings
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSync"
                  className="mr-2"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                />
                <label htmlFor="autoSync" className="text-gray-300">
                  Automatically sync schedules daily
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyChanges"
                  className="mr-2"
                  checked={notifyChanges}
                  onChange={(e) => setNotifyChanges(e.target.checked)}
                />
                <label htmlFor="notifyChanges" className="text-gray-300">
                  Notify me when schedule changes
                </label>
              </div>
            </div>

            {/* Manual Sync Section */}
            <div className="bg-gray-700/50 rounded-lg p-4 mt-6">
              <h4 className="text-white font-medium mb-3">Manual Sync</h4>
              <p className="text-sm text-gray-400 mb-4">
                Import schedule data from 7shifts for a specific date range
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input w-full"
                    value={syncStartDate}
                    onChange={(e) => setSyncStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="input w-full"
                    value={syncEndDate}
                    onChange={(e) => setSyncEndDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleSync7shifts}
                disabled={isConnecting || !isConnected}
                className="btn-primary w-full mt-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-4">
                {isConnected
                  ? "Your 7shifts account is connected. You can configure how schedules are synced between platforms."
                  : "Connect your 7shifts account to enable these settings. Once connected, you can configure how schedules are synced between platforms."}
              </p>
              <div className="flex justify-end">
                <button onClick={handleSaveSettings} className="btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Configuration Tab */}
      {activeTab === "config" && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">
                CSV Configuration
              </h2>
              <p className="text-sm text-gray-400">
                Manage CSV import mappings for different schedule formats
              </p>
            </div>
          </div>

          {/* Mapping Manager Component */}
          <MappingManager
            onSelectMapping={setSelectedMapping}
            onCreateMapping={() => {
              setCsvFile(null);
              setSelectedMapping(null);
              setIsUploadModalOpen(true);
              setShowCSVConfig(true);
            }}
          />

          {/* CSV Format Information */}
          <div className="mt-6 bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Supported Formats
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Standard Format</h4>
                <p className="text-sm text-gray-400 mb-2">
                  CSV with separate columns for date, start time, and end time.
                </p>
                <div className="text-xs text-gray-500">
                  Example: 7shifts, HotSchedules exports
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Weekly Format</h4>
                <p className="text-sm text-gray-400 mb-2">
                  CSV with days of the week as columns and shift times in cells.
                </p>
                <div className="text-xs text-gray-500">
                  Example: Excel weekly schedules
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">Custom Format</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Any CSV format with custom column mappings you define.
                </p>
                <div className="text-xs text-gray-500">
                  Example: POS exports, custom spreadsheets
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employee Matching Modal */}
      <EmployeeMatchingModal
        isOpen={isEmployeeMatchingModalOpen}
        onClose={() => setIsEmployeeMatchingModalOpen(false)}
        scheduleEmployees={parsedShifts.map((shift) => ({
          employee_name: shift.employee_name,
          first_name: shift.first_name,
          last_name: shift.last_name,
          role: shift.role,
        }))}
        onConfirmMatches={async (matches) => {
          setEmployeeMatches(matches);
          setIsEmployeeMatchingModalOpen(false);

          try {
            setIsUploading(true);

            // Apply the matches to the parsed shifts
            const matchedShifts = parsedShifts.map((shift) => {
              const match = matches[shift.employee_name];
              if (match) {
                return {
                  ...shift,
                  employee_id: match.punch_id || match.id,
                  first_name: match.first_name,
                  last_name: match.last_name,
                  punch_id: match.punch_id,
                };
              }
              return shift;
            });

            console.log(
              `Uploading ${matchedShifts.length} shifts to schedule store`,
            );

            // Call the actual upload function from the store with the matched shifts
            await uploadSchedule(csvFile, {
              startDate: startDate,
              endDate: endDate,
              activateImmediately: activateImmediately,
              source: "csv",
              selectedMapping: selectedMapping,
              matchedShifts: matchedShifts,
            });

            // Refresh the schedule data
            if (activateImmediately) {
              await fetchCurrentSchedule();
            } else {
              await fetchUpcomingSchedule();
            }

            toast.success(
              `Schedule uploaded successfully as ${activateImmediately ? "current" : "upcoming"} schedule`,
            );
            setCsvFile(null);
            setPreviewData(null);
            setIsUploadModalOpen(false);
          } catch (error) {
            console.error("Error uploading schedule:", error);
            toast.error(scheduleError || "Failed to upload schedule");
          } finally {
            setIsUploading(false);
          }
        }}
      />

      {/* Schedule View Modal */}
      {isViewModalOpen && selectedScheduleId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg w-full max-w-5xl my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Schedule Details
              </h3>
              <div className="flex items-center gap-3">
                <TimeFormatToggle
                  timeFormat={timeFormat}
                  onChange={setTimeFormat}
                />
                <button
                  onClick={() => exportScheduleToCSV(selectedScheduleId)}
                  className="btn-ghost text-sm"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
                </div>
              ) : scheduleShifts.length > 0 ? (
                <div className="space-y-6">
                  {/* Schedule info */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">
                      Schedule Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Total Shifts:</span>
                        <span className="text-white ml-2">
                          {scheduleShifts.length}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Unique Employees:</span>
                        <span className="text-white ml-2">
                          {
                            new Set(scheduleShifts.map((s) => s.employee_name))
                              .size
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date Range:</span>
                        <span className="text-white ml-2">
                          {scheduleShifts.length > 0
                            ? `${new Date(Math.min(...scheduleShifts.map((s) => new Date(s.shift_date).getTime()))).toLocaleDateString()} - 
                             ${new Date(Math.max(...scheduleShifts.map((s) => new Date(s.shift_date).getTime()))).toLocaleDateString()}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shifts table */}
                  <div className="bg-gray-800/50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-700/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                            Employee
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                            Start Time
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                            End Time
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                            Duration
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {scheduleShifts
                          .sort(
                            (a, b) =>
                              a.shift_date.localeCompare(b.shift_date) ||
                              a.start_time.localeCompare(b.start_time),
                          )
                          .map((shift) => {
                            // Calculate shift duration
                            const startParts = shift.start_time.split(":");
                            const endParts = shift.end_time.split(":");
                            const startHours = parseInt(startParts[0]);
                            const startMinutes = parseInt(startParts[1]);
                            const endHours = parseInt(endParts[0]);
                            const endMinutes = parseInt(endParts[1]);

                            let durationHours = endHours - startHours;
                            let durationMinutes = endMinutes - startMinutes;

                            if (durationMinutes < 0) {
                              durationHours -= 1;
                              durationMinutes += 60;
                            }

                            // Handle overnight shifts
                            if (durationHours < 0) {
                              durationHours += 24;
                            }

                            const durationStr = `${durationHours}h ${durationMinutes}m`;

                            return (
                              <tr
                                key={shift.id}
                                className="hover:bg-gray-700/30"
                              >
                                <td className="px-4 py-2 text-sm text-white">
                                  {shift.employee_name}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {shift.role ? (
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${(() => {
                                        // Generate a consistent color for each role
                                        const roleHash = shift.role
                                          .split("")
                                          .reduce(
                                            (acc, char) =>
                                              acc + char.charCodeAt(0),
                                            0,
                                          );
                                        const bgColors = [
                                          "bg-primary-500/20 text-primary-400",
                                          "bg-green-500/20 text-green-400",
                                          "bg-amber-500/20 text-amber-400",
                                          "bg-rose-500/20 text-rose-400",
                                          "bg-purple-500/20 text-purple-400",
                                          "bg-blue-500/20 text-blue-400",
                                        ];
                                        return bgColors[
                                          roleHash % bgColors.length
                                        ];
                                      })()}`}
                                    >
                                      {shift.role}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">N/A</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {new Date(
                                    shift.shift_date,
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {formatTime(shift.start_time, timeFormat)}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {formatTime(shift.end_time, timeFormat)}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {durationStr}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-white mb-2">
                    No Shifts Found
                  </h4>
                  <p className="text-gray-400">
                    There are no shifts associated with this schedule.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Schedule Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Upload Schedule
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setShowCSVConfig(false);
                  setCsvFile(null);
                  setPreviewData(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {showCSVConfig ? (
                <CSVConfiguration
                  previewData={previewData}
                  onSaveMapping={handleSaveMapping}
                  onCancel={() => setShowCSVConfig(false)}
                />
              ) : (
                <div className="space-y-6">
                  {/* File Upload */}
                  <div
                    className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => {
                      const input = document.getElementById(
                        "schedule-file-input",
                      ) as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    <input
                      type="file"
                      id="schedule-file-input"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <FileSpreadsheet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    {csvFile ? (
                      <div>
                        <p className="text-white font-medium">{csvFile.name}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {(csvFile.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                          className="text-primary-400 text-sm mt-2 hover:text-primary-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCsvFile(null);
                            setPreviewData(null);
                          }}
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-medium">
                          Drag & drop your CSV file here
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          or click to browse files
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mapping Selection */}
                  {csvFile && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          CSV Mapping
                        </label>
                        <div className="flex gap-2">
                          <select
                            className="input flex-1"
                            value={selectedMapping?.id || ""}
                            onChange={(e) => {
                              const mappingId = e.target.value;
                              const mapping = mappings.find(
                                (m) => m.id === mappingId,
                              );
                              setSelectedMapping(mapping || null);
                            }}
                          >
                            <option value="">Select a mapping</option>
                            {mappings.map((mapping) => (
                              <option key={mapping.id} value={mapping.id}>
                                {mapping.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => setShowCSVConfig(true)}
                            className="btn-secondary whitespace-nowrap"
                          >
                            Configure New
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            className="input w-full"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            End Date
                          </label>
                          <input
                            type="date"
                            className="input w-full"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="activate-immediately"
                          className="mr-2"
                          checked={activateImmediately}
                          onChange={(e) =>
                            setActivateImmediately(e.target.checked)
                          }
                        />
                        <label
                          htmlFor="activate-immediately"
                          className="text-gray-300"
                        >
                          Activate immediately (replace current schedule)
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!showCSVConfig && (
              <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setCsvFile(null);
                    setPreviewData(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!csvFile || !selectedMapping || isUploading}
                  className="btn-primary"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    "Upload Schedule"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentSchedule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Delete Current Schedule
              </h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete the current schedule? This
                action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const success = await useScheduleStore
                        .getState()
                        .deleteSchedule(currentSchedule.id);
                      if (success) {
                        toast.success("Schedule deleted successfully");
                        setIsDeleteModalOpen(false);
                      } else {
                        toast.error("Failed to delete schedule");
                      }
                    } catch (error) {
                      console.error("Error deleting schedule:", error);
                      toast.error("An error occurred while deleting schedule");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="btn-danger"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Schedule"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
