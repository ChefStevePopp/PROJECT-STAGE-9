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
} from "lucide-react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { useScheduleStore } from "@/stores/scheduleStore";
import { ScheduleShift } from "@/types/schedule";
import {
  CSVConfiguration,
  ColumnMapping,
  TimeFormatToggle,
} from "./components";
import { parseScheduleCsvWithMapping } from "@/lib/schedule-parser-enhanced";

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
  const [isUploading, setIsUploading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [upcomingSchedule, setUpcomingSchedule] = useState<any | null>(null);
  const [activateImmediately, setActivateImmediately] = useState(false);
  const [showCSVConfig, setShowCSVConfig] = useState(false);
  const [savedMappings, setSavedMappings] = useState<ColumnMapping[]>([]);
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
  } = useScheduleStore();

  // Load saved mappings from localStorage on component mount
  useEffect(() => {
    const savedMappingsStr = localStorage.getItem("schedule-csv-mappings");
    if (savedMappingsStr) {
      try {
        const mappings = JSON.parse(savedMappingsStr);
        setSavedMappings(mappings);
      } catch (error) {
        console.error("Error loading saved mappings:", error);
      }
    }
  }, []);

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
    // Check if we're updating an existing mapping
    const updatedMappings = savedMappings.some((m) => m.id === mapping.id)
      ? savedMappings.map((m) => (m.id === mapping.id ? mapping : m))
      : [...savedMappings, mapping];

    setSavedMappings(updatedMappings);
    setSelectedMapping(mapping);
    localStorage.setItem(
      "schedule-csv-mappings",
      JSON.stringify(updatedMappings),
    );
    setShowCSVConfig(false);
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

      console.log(`Uploading ${shifts.length} shifts to schedule store`);

      // Call the actual upload function from the store
      await uploadSchedule(csvFile, {
        startDate: startDate,
        endDate: endDate,
        activateImmediately: activateImmediately,
        source: "csv",
        selectedMapping: selectedMapping,
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
  };

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

  // Fetch current schedule when component mounts
  useEffect(() => {
    const fetchCurrentScheduleData = async () => {
      const result = await fetchCurrentSchedule();
      // Get the latest currentSchedule from the store after fetching
      const latestSchedule = useScheduleStore.getState().currentSchedule;
      if (latestSchedule?.id) {
        await fetchShifts(latestSchedule.id);
      }
    };
    fetchCurrentScheduleData();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "current") {
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
    }
  }, [activeTab]);

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
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`tab primary ${activeTab === "current" ? "active" : ""}`}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Current Schedule
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`tab blue ${activeTab === "upcoming" ? "active" : ""}`}
        >
          <Clock className="w-5 h-5 mr-2" />
          Upcoming Schedules
        </button>
        <button
          onClick={() => setActiveTab("previous")}
          className={`tab amber ${activeTab === "previous" ? "active" : ""}`}
        >
          <History className="w-5 h-5 mr-2" />
          Previous Schedules
        </button>
        <button
          onClick={() => setActiveTab("integration")}
          className={`tab green ${activeTab === "integration" ? "active" : ""}`}
        >
          <Link className="w-5 h-5 mr-2" />
          7shifts Integration
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`tab purple ${activeTab === "config" ? "active" : ""}`}
        >
          <Settings className="w-5 h-5 mr-2" />
          CSV Configuration
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
                            {day.shifts.map((shift) => (
                              <div
                                key={shift.id}
                                className="text-xs bg-gray-600/50 p-2 rounded text-left"
                              >
                                <div className="font-medium text-white">
                                  {shift.first_name ||
                                    shift.employee_name.split(" ")[0]}{" "}
                                  {shift.last_name}
                                </div>
                                {shift.role && (
                                  <div className="text-primary-400 text-[10px] uppercase font-medium">
                                    {shift.role}
                                  </div>
                                )}
                                <div className="text-gray-300 mt-1">
                                  {formatTime(shift.start_time, timeFormat)} -{" "}
                                  {formatTime(shift.end_time, timeFormat)}
                                </div>
                              </div>
                            ))}
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
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
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
                    Week of {upcomingSchedule.startDate} -{" "}
                    {upcomingSchedule.endDate}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Uploaded:{" "}
                    {new Date(upcomingSchedule.uploadedAt).toLocaleString()}
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
                      File:{" "}
                      <span className="text-blue-400">
                        {upcomingSchedule.file}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      This schedule will replace the current schedule when
                      activated.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost text-sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                    <button className="btn-ghost text-sm text-rose-400 hover:text-rose-300">
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
                            await fetchShifts(schedule.id);
                            // Open a modal or navigate to a view to show the shifts
                            toast.success(
                              "Loaded shifts for selected schedule",
                            );
                          }
                        }}
                        className="btn-ghost text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button className="btn-ghost text-sm">
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
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Link className="w-5 h-5 text-green-400" />
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
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <img
                    src="https://framerusercontent.com/images/GTwNANjmDcbIsFhKyhhH32pNv4.png?scale-down-to=512"
                    alt="7shifts logo"
                    className="w-8 h-8 object-contain rounded"
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">7shifts</h3>
                  <p className="text-sm text-gray-400">Not connected</p>
                </div>
              </div>
              <button className="btn-primary bg-green-500 hover:bg-green-600">
                Connect Account
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
                  disabled
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
                  disabled
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
                  disabled
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
                  disabled
                />
                <label htmlFor="notifyChanges" className="text-gray-300">
                  Notify me when schedule changes
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-4">
                Connect your 7shifts account to enable these settings. Once
                connected, you can configure how schedules are synced between
                platforms.
              </p>
              <div className="flex justify-end">
                <button className="btn-primary" disabled>
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
            <div className="ml-auto">
              <button
                onClick={() => {
                  setCsvFile(null);
                  setSelectedMapping(null);
                  setShowCSVConfig(true);
                }}
                className="btn-primary"
              >
                Create New Mapping
              </button>
            </div>
          </div>

          {/* Saved Mappings */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Saved Mappings
            </h3>

            {savedMappings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedMappings.map((mapping) => (
                  <div
                    key={mapping.id}
                    className={`bg-gray-800/50 rounded-lg p-4 border ${selectedMapping?.id === mapping.id ? "border-purple-500" : "border-gray-700"} hover:border-purple-500/50 cursor-pointer transition-colors`}
                    onClick={() => setSelectedMapping(mapping)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{mapping.name}</h4>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                        {mapping.format}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {mapping.format === "standard" && (
                        <p>
                          Standard format with date, start time, and end time
                          columns
                        </p>
                      )}
                      {mapping.format === "weekly" && (
                        <p>Weekly format with days of the week as columns</p>
                      )}
                      {mapping.format === "custom" && (
                        <p>Custom format with user-defined mappings</p>
                      )}
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCsvFile(null);
                          setSelectedMapping(mapping);
                          setShowCSVConfig(true);
                        }}
                        className="text-sm text-purple-400 hover:text-purple-300"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                <Settings className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Saved Mappings
                </h3>
                <p className="text-gray-400 max-w-md mx-auto mb-4">
                  Create a mapping to define how your CSV files should be
                  imported. This helps handle different schedule formats from
                  various systems.
                </p>
                <button
                  onClick={() => {
                    // Open the upload modal first
                    setIsUploadModalOpen(true);
                    // Reset any existing file and mapping
                    setCsvFile(null);
                    setSelectedMapping(null);
                    // Show the CSV config immediately
                    setShowCSVConfig(true);
                  }}
                  className="btn-primary"
                >
                  Create First Mapping
                </button>
              </div>
            )}
          </div>

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

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Upload Schedule
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setCsvFile(null);
                  setPreviewData(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!csvFile ? (
                <div
                  className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary-500/50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <FileSpreadsheet className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-gray-500 mb-4">or</p>
                  <label className="btn-primary cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    Browse Files
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-primary-400" />
                      <div>
                        <p className="text-white">{csvFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(csvFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-300"
                      onClick={() => {
                        setCsvFile(null);
                        setPreviewData(null);
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* CSV Configuration */}
                  {showCSVConfig ? (
                    <CSVConfiguration
                      csvFile={csvFile}
                      onSaveMapping={handleSaveMapping}
                      onClose={() => setShowCSVConfig(false)}
                      savedMappings={savedMappings}
                    />
                  ) : (
                    <>
                      {/* Preview Section */}
                      {previewData && previewData.length > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h3 className="text-white font-medium mb-2">
                            Schedule Preview
                          </h3>
                          <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full">
                              <thead className="bg-gray-700/50">
                                <tr>
                                  {/* Dynamically generate headers based on the first row */}
                                  {Object.keys(previewData[0]).map((header) => (
                                    <th
                                      key={header}
                                      className="px-4 py-2 text-left text-sm font-medium text-gray-400"
                                    >
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700">
                                {previewData.slice(0, 10).map((row, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-gray-700/30"
                                  >
                                    {Object.entries(row)
                                      .map(([key, value], cellIndex) => {
                                        // Skip displaying first_name and last_name separately if they exist
                                        if (
                                          (key === "first_name" ||
                                            key === "last_name") &&
                                          row.employee_name
                                        ) {
                                          return null;
                                        }
                                        return (
                                          <td
                                            key={cellIndex}
                                            className="px-4 py-2 text-sm text-gray-300"
                                          >
                                            {value as string}
                                          </td>
                                        );
                                      })
                                      .filter(Boolean)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {previewData.length > 10 && (
                              <div className="text-center text-sm text-gray-400 mt-2">
                                Showing 10 of {previewData.length} rows
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* CSV Mapping Selection */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-3">
                          CSV Format
                        </h3>

                        {savedMappings.length > 0 ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-2">
                                Select a saved mapping
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {savedMappings.map((mapping) => (
                                  <button
                                    key={mapping.id}
                                    onClick={() => setSelectedMapping(mapping)}
                                    className={`px-3 py-1.5 rounded-lg text-sm ${selectedMapping?.id === mapping.id ? "bg-primary-500/20 text-primary-400 border border-primary-500/50" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                                  >
                                    {mapping.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setShowCSVConfig(true)}
                                className="text-sm text-primary-400 hover:text-primary-300"
                              >
                                Create new mapping
                              </button>

                              {selectedMapping && (
                                <button
                                  onClick={() => setShowCSVConfig(true)}
                                  className="text-sm text-primary-400 hover:text-primary-300"
                                >
                                  Edit selected mapping
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-gray-400 mb-3">
                              You need to create a mapping to define how your
                              CSV columns should be imported.
                            </p>
                            <button
                              onClick={() => setShowCSVConfig(true)}
                              className="btn-primary"
                            >
                              Configure CSV Mapping
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Date Range Selection */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-3">
                          Schedule Date Range
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="activateImmediately"
                            checked={activateImmediately}
                            onChange={(e) =>
                              setActivateImmediately(e.target.checked)
                            }
                            className="mr-2"
                          />
                          <label
                            htmlFor="activateImmediately"
                            className="text-white"
                          >
                            Activate immediately as current schedule
                          </label>
                        </div>
                        <p className="text-sm text-gray-400">
                          {activateImmediately
                            ? "This schedule will replace the current schedule immediately."
                            : "This schedule will be saved as an upcoming schedule that you can activate later."}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 flex justify-end gap-3">
              <button
                className="btn-ghost"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setCsvFile(null);
                  setPreviewData(null);
                  setShowCSVConfig(false);
                }}
              >
                Cancel
              </button>
              {showCSVConfig ? (
                <button
                  className="btn-primary"
                  onClick={() => setShowCSVConfig(false)}
                >
                  Back to Upload
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading || !csvFile || !selectedMapping}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>Upload Schedule</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
