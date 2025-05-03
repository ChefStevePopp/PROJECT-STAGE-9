import React, { useState, useEffect } from "react";
import { Task } from "@/types/tasks";
import { useUserNameMapping } from "@/hooks/useUserNameMapping";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity-logger";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  MapPin,
  Users,
  RefreshCw,
  CheckCircle,
  CalendarClock,
  Play,
  Pause,
  Settings,
  Square,
  Clock,
  AlertCircle,
  Timer,
} from "lucide-react";
import toast from "react-hot-toast";

interface AssignmentStatusProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export const AssignmentStatus: React.FC<AssignmentStatusProps> = ({
  task,
  onComplete,
}) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { getUserName } = useUserNameMapping();
  const { user, organization } = useAuth();
  const [isRunning, setIsRunning] = useState(task.status === "in_progress");
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [activeTime, setActiveTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);

  // Always use the task's estimated_time from the database
  const displayEstimatedTime = task.estimated_time;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setActiveTime((prevActiveTime) => prevActiveTime + 1);
      }, 1000);
    } else if (isPaused) {
      interval = setInterval(() => {
        setPauseTime((prevPauseTime) => prevPauseTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Format time in HH:MM:SS
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Format the estimated time in minutes
  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  // Function to accept a task (for the current user)
  const acceptTask = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user?.id) {
        toast.error("You must be logged in to accept a task");
        return;
      }

      // Update local task state
      task.assignment_type = "direct";
      task.assignee_id = data.user.id;
      task.kitchen_station = null;
      task.assignee_station = null;
      task.default_station = null;
      task.station = null; // Keeping for backward compatibility
      task.lottery = false;

      // Log the task acceptance activity
      if (organization?.id && user?.id) {
        await logActivity({
          organization_id: organization.id,
          user_id: user.id,
          activity_type: "task_accepted",
          details: {
            task_id: task.id,
            task_title: task.title,
            user_name:
              user.user_metadata?.firstName +
              " " +
              user.user_metadata?.lastName,
            previous_assignment: task.assignment_type || "unassigned",
            new_assignment: "direct",
          },
        });
      }

      toast.success("Task accepted and assigned to you");
    } catch (error) {
      console.error("Error accepting task:", error);
      toast.error("Failed to accept task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStart = async () => {
    if (!task.assignee_id) {
      toast.error("Task must be assigned before starting");
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setIsStopped(false);

    supabase
      .from("prep_list_template_tasks")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error starting task:", error);
          toast.error("Failed to start task");
          setIsRunning(false);
        } else {
          task.status = "in_progress";

          // Log the task started activity
          if (organization?.id && user?.id) {
            logActivity({
              organization_id: organization.id,
              user_id: user.id,
              activity_type: "task_started",
              details: {
                task_id: task.id,
                task_title: task.title,
                user_name:
                  user.user_metadata?.firstName +
                  " " +
                  user.user_metadata?.lastName,
                previous_status: task.status || "pending",
                new_status: "in_progress",
              },
            }).catch((err) =>
              console.error("Error logging task started activity:", err),
            );
          }

          toast.success("Task started");
        }
      });
  };

  const handlePause = async () => {
    if (!task.assignee_id) {
      toast.error("Task must be assigned before pausing");
      return;
    }

    setIsRunning(false);
    setIsPaused(true);

    // Get current time for pause calculation
    const pauseTime = new Date().toISOString();

    // First get the current task to calculate pause duration
    supabase
      .from("prep_list_template_tasks")
      .select("started_at, total_pause_time")
      .eq("id", task.id)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error("Error fetching task data:", fetchError);
          toast.error("Failed to pause task");
          setIsPaused(false);
          setIsRunning(true);
          return;
        }

        // Calculate pause duration if we have a started_at time
        let totalPauseTime = data.total_pause_time || 0;

        // Now update the task with pause information
        supabase
          .from("prep_list_template_tasks")
          .update({
            status: "pending",
            paused_at: pauseTime,
            total_pause_time: totalPauseTime,
          })
          .eq("id", task.id)
          .then(({ error }) => {
            if (error) {
              console.error("Error pausing task:", error);
              toast.error("Failed to pause task");
              setIsPaused(false);
              setIsRunning(true);
            } else {
              const previousStatus = task.status || "in_progress";
              task.status = "pending";

              // Log the task paused activity
              if (organization?.id && user?.id) {
                logActivity({
                  organization_id: organization.id,
                  user_id: user.id,
                  activity_type: "task_paused",
                  details: {
                    task_id: task.id,
                    task_title: task.title,
                    user_name:
                      user.user_metadata?.firstName +
                      " " +
                      user.user_metadata?.lastName,
                    previous_status: previousStatus,
                    new_status: "pending",
                    pause_time: pauseTime,
                  },
                }).catch((err) =>
                  console.error("Error logging task paused activity:", err),
                );
              }

              toast.success("Task paused");
            }
          });
      });
  };

  const handleStop = async () => {
    if (!task.assignee_id) {
      toast.error("Task must be assigned before stopping");
      return;
    }

    // Stop all timers and reset
    setIsRunning(false);
    setIsPaused(false);
    setIsStopped(true);

    supabase
      .from("prep_list_template_tasks")
      .update({
        status: "pending",
        stopped_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error stopping task:", error);
          toast.error("Failed to stop task");
        } else {
          task.status = "pending";
          toast.success("Task stopped");
        }
      });
  };

  const handleComplete = async () => {
    if (!task.assignee_id) {
      toast.error("Task must be assigned before completing");
      return;
    }

    // Stop all timers
    setIsRunning(false);
    setIsPaused(false);
    setIsStopped(true);

    // Update completion time in database before calling onComplete
    supabase
      .from("prep_list_template_tasks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", task.id)
      .then(({ error }) => {
        if (error) {
          console.error("Error completing task:", error);
          toast.error("Failed to complete task");
        } else {
          // Now call the onComplete handler
          onComplete(task.id);
        }
      });
  };

  return (
    <div className="mb-3 p-2 rounded-lg bg-gray-800/70 border border-gray-700/70 shadow-inner">
      {/* Header with icon */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-lg text-gray-400 bg-slate-700/30 p-2 border border-gray-500/30 rounded-lg mb-2 w-full">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-400/30 rounded-full border border-blue-300/50 mr-2">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex items-center justify-between w-full">
            <span className="text-m text-white pl-1 p-1 font-medium">
              Assignment Status
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Assignment Status Cards */}
        {task.assignment_type === "direct" && task.assignee_id ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {/* Task Accepted - Green Card */}
            <div className="flex items-center gap-2 text-white bg-green-500/20 p-2 rounded-lg border border-green-500/50 shadow-sm">
              <User className="w-4 h-4 text-green-400" />
              <span className="font-medium truncate">
                Accepted by: {getUserName(task.assignee_id)}
              </span>
            </div>

            {/* Station Assignment - Only show if available */}
            {(task.assignee_station ||
              task.default_station ||
              task.station ||
              task.kitchen_station) && (
              <div className="flex items-center gap-2 text-white bg-blue-500/20 p-2 rounded-lg border border-blue-500/50 shadow-sm">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="font-medium truncate">
                  {task.assignee_station ||
                    task.default_station ||
                    task.station ||
                    task.kitchen_station}
                </span>
              </div>
            )}
          </div>
        ) : task.assignment_type === "station" ||
          (!task.assignment_type &&
            (task.assignee_station ||
              task.default_station ||
              task.station ||
              task.kitchen_station)) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {/* Station Assignment - Primary Card */}
            <div className="flex items-center gap-2 text-white bg-blue-500/20 p-2 rounded-lg border border-blue-500/50 shadow-sm">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="font-medium truncate">
                {task.assignee_station ||
                  task.default_station ||
                  task.station ||
                  task.kitchen_station ||
                  ""}
              </span>
            </div>

            {/* Task Accepted Status */}
            {task.assignee_id ? (
              <div className="flex items-center gap-2 text-white bg-green-500/20 p-2 rounded-lg border border-green-500/50 shadow-sm">
                <User className="w-4 h-4 text-green-400" />
                <span className="font-medium truncate">
                  Accepted by: {getUserName(task.assignee_id)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white bg-gray-700/50 p-2 rounded-lg border border-gray-700 shadow-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">Awaiting acceptance</span>
              </div>
            )}
          </div>
        ) : task.assignment_type === "lottery" || task.lottery ? (
          <div className="flex items-center justify-center gap-2 text-white bg-rose-500/20 p-3 rounded-lg border border-rose-500/50 shadow-sm">
            <Users className="w-5 h-5 text-rose-400" />
            <span className="font-medium text-rose-300">
              Available in lottery pool
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-white bg-gray-700/50 p-3 rounded-lg border border-gray-700 shadow-sm">
            <AlertCircle className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-300">Not assigned</span>
          </div>
        )}

        {/* Original station info - only show if different from assigned station */}
        {task.assignment_type === "station" &&
        task.assignee_station &&
        (task.default_station || task.station || task.kitchen_station) &&
        task.assignee_station !==
          (task.default_station || task.station || task.kitchen_station) ? (
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span>
              Original station:{" "}
              {task.default_station || task.station || task.kitchen_station}
            </span>
          </div>
        ) : !task.assignment_type &&
          !task.assignee_station &&
          (task.default_station || task.kitchen_station || task.station) ? (
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span>
                Default station:{" "}
                {task.default_station || task.station || task.kitchen_station}
              </span>
            </div>
            {task.auto_advance !== false && (
              <div className="flex items-center gap-1 text-amber-400">
                <CalendarClock className="w-3 h-3" />
                <span>Auto-advances daily</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Accept Task Button - Only show when task is in lottery pool or assigned to station and not yet accepted by current user */}
        {(task.assignment_type === "lottery" ||
          task.lottery ||
          (task.assignment_type === "station" && !task.assignee_id) ||
          (!task.assignment_type &&
            (task.assignee_station ||
              task.default_station ||
              task.station ||
              task.kitchen_station) &&
            !task.assignee_id)) && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                acceptTask();
              }}
              disabled={isUpdating}
              className={`w-full flex items-center justify-center gap-2 bg-green-500/30 hover:bg-green-500/40 text-green-300 px-3 py-2 rounded-lg transition-colors border border-green-500/50 ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Accepting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Accept This Task</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Timer Display - Enhanced with more visual emphasis and clearer estimated time indication */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="bg-slate-800/50 rounded-lg border border-slate-600/30 p-3 shadow-inner">
            <div className="flex flex-col items-center mb-2">
              {/* Timer Header */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-blue-500/20 rounded-md">
                    <Clock className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-sm font-medium text-white">
                    Current Time
                  </div>
                  {isRunning && !isPaused && (
                    <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/50">
                      Running
                    </span>
                  )}
                  {isPaused && (
                    <span className="text-xs bg-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/50">
                      Paused
                    </span>
                  )}
                  {isStopped && (
                    <span className="text-xs bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/50">
                      Stopped
                    </span>
                  )}
                </div>
              </div>

              {/* Active Timer */}
              <div className="text-2xl font-mono text-white bg-slate-700/50 px-6 py-2 rounded-md border border-slate-600/50 shadow-inner mb-2 w-full text-center">
                {formatTime(activeTime)}
              </div>

              {/* Estimated Time - Clearly placed under the timer */}
              {task.estimated_time > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-md border border-slate-600/30 w-full">
                  <div className="w-5 h-5 flex items-center justify-center bg-amber-400/20 rounded-md border border-amber-300/30">
                    <Timer className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="text-sm text-amber-300 font-medium">
                    Estimated time: {task.estimated_time} min
                  </span>
                </div>
              )}
            </div>

            {/* Pause Duration - If applicable */}
            {isPaused && (
              <div className="flex items-center justify-between text-xs text-gray-400 mt-2 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <span>Pause duration:</span>
                <span className="font-mono text-amber-300">
                  {formatTime(pauseTime)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Task Action Buttons - Enhanced with more visual emphasis */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 shadow-lg">
            <h4 className="text-sm font-medium text-white mb-3">
              Task Controls
            </h4>

            <div className="grid grid-cols-2 gap-2 mb-2">
              {/* Start Button - More prominent */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-colors bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 border border-blue-500/40 hover:border-blue-500/60"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/30 rounded-full border border-blue-400/50 mb-1">
                  <Play className="w-4 h-4" />
                </div>
                <span className="font-medium">Start</span>
              </button>

              {/* Pause Button - More prominent */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePause();
                }}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-colors bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 border border-amber-500/40 hover:border-amber-500/60"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-amber-500/30 rounded-full border border-amber-400/50 mb-1">
                  <Pause className="w-4 h-4" />
                </div>
                <span className="font-medium">Pause</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Stop Button - More prominent */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStop();
                }}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-colors bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 border border-rose-500/40 hover:border-rose-500/60"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-rose-500/30 rounded-full border border-rose-400/50 mb-1">
                  <Square className="w-4 h-4" />
                </div>
                <span className="font-medium">Stop</span>
              </button>

              {/* Complete Button - More prominent */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete();
                }}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition-colors bg-green-500/20 text-green-400 hover:bg-green-500/40 border border-green-500/40 hover:border-green-500/60"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-green-500/30 rounded-full border border-green-400/50 mb-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="font-medium">Complete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
