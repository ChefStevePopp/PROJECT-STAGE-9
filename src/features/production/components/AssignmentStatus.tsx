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
} from "lucide-react";
import toast from "react-hot-toast";

interface AssignmentStatusProps {
  task: Task;
  onComplete: (taskId: string) => void;
  estimatedTime?: number;
}

export const AssignmentStatus: React.FC<AssignmentStatusProps> = ({
  task,
  onComplete,
  estimatedTime,
}) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { getUserName } = useUserNameMapping();
  const { user, organization } = useAuth();
  const [isRunning, setIsRunning] = useState(task.status === "in_progress");
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [activeTime, setActiveTime] = useState(0);
  const [pauseTime, setPauseTime] = useState(0);

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
      task.station = null;
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
    <div className="mb-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/70 shadow-inner">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700/50">
        <h4 className="text-sm font-medium text-white">Assignment Status</h4>
        {estimatedTime ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full">
            <CalendarClock className="w-3 h-3 text-primary-400" />
            <span className="text-xs text-gray-300">
              {formatEstimatedTime(estimatedTime)} allotted
            </span>
          </div>
        ) : null}
      </div>
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
          {(task.assignee_station || task.kitchen_station || task.station) && (
            <div className="flex items-center gap-2 text-white bg-blue-500/20 p-2 rounded-lg border border-blue-500/50 shadow-sm">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="font-medium truncate">
                {task.assignee_station || task.kitchen_station || task.station}
              </span>
            </div>
          )}
        </div>
      ) : task.assignment_type === "station" ||
        (!task.assignment_type &&
          (task.assignee_station || task.kitchen_station || task.station)) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {/* Station Assignment - Primary Card */}
          <div className="flex items-center gap-2 text-white bg-blue-500/20 p-2 rounded-lg border border-blue-500/50 shadow-sm">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="font-medium truncate">
              {task.assignee_station ||
                task.kitchen_station ||
                task.station ||
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
          <User className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-300">Not assigned</span>
        </div>
      )}
      {/* Original station info - only show if different from assigned station */}
      {task.assignment_type === "station" &&
      task.assignee_station &&
      (task.kitchen_station || task.station) &&
      task.assignee_station !== (task.kitchen_station || task.station) ? (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
          <MapPin className="w-3 h-3 text-gray-500" />
          <span>Original station: {task.kitchen_station || task.station}</span>
        </div>
      ) : !task.assignment_type &&
        !task.assignee_station &&
        (task.kitchen_station || task.station) ? (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-gray-500" />
            <span>Default station: {task.kitchen_station || task.station}</span>
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
          (task.assignee_station || task.kitchen_station || task.station) &&
          !task.assignee_id)) && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
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
      {/* Timer Display */}
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-white">Task Timer</div>
            {isRunning && !isPaused && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                Running
              </span>
            )}
            {isPaused && (
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                Paused
              </span>
            )}
            {isStopped && (
              <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
                Stopped
              </span>
            )}
          </div>
          <div className="text-lg font-mono text-white">
            {formatTime(activeTime)}
          </div>
        </div>
        {isPaused && (
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>Pause duration:</span>
            <span className="font-mono">{formatTime(pauseTime)}</span>
          </div>
        )}
      </div>
      {/* Task Action Buttons - Always visible regardless of assignment status */}
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-lg justify-evenly">
          {/* Start Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          >
            <Play className="w-3 h-3" />
            Start
          </button>

          {/* Pause Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePause();
            }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
          >
            <Pause className="w-3 h-3" />
            Pause
          </button>

          {/* Stop Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStop();
            }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
          >
            <Square className="w-3 h-3" />
            Stop
          </button>

          {/* Complete Button - Always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-green-500/20 text-green-400 hover:bg-green-500/30"
          >
            <CheckCircle className="w-3 h-3" />
            Complete
          </button>
        </div>

        {/* Estimated Time Display - Moved to its own row for better spacing */}
        <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-2">
          <CalendarClock className="w-3 h-3" />
          <span>
            Estimated time:{" "}
            {estimatedTime ? formatEstimatedTime(estimatedTime) : "--"}
          </span>
        </div>
      </div>
    </div>
  );
};
