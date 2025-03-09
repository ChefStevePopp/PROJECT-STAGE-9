import React, { useEffect } from "react";
import { UtensilsCrossed, CheckCircle2, Circle, Clock } from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";
import { useAuth } from "@/hooks/useAuth";

export const TasksWidget: React.FC = () => {
  const { tasks, isLoading, fetchTasks, updateTask } = useTaskStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks for the current user that are due today and not completed
  const today = new Date().toISOString().split("T")[0];
  const myTasks = tasks.filter((task) => {
    const taskDate = new Date(task.due_date).toISOString().split("T")[0];
    return (
      taskDate === today && !task.completed && task.assignee_id === user?.id
    );
  });

  const handleToggleComplete = async (taskId: string) => {
    await updateTask(taskId, { completed: true });
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-white mb-3">My Tasks</h2>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-gray-700/50 rounded"></div>
          <div className="h-10 bg-gray-700/50 rounded"></div>
          <div className="h-10 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold text-white mb-3">My Tasks</h2>

      {myTasks.length === 0 ? (
        <div className="text-center py-6">
          <UtensilsCrossed className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">No tasks assigned for today</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {myTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <button
                onClick={() => handleToggleComplete(task.id)}
                className="mt-1 flex-shrink-0"
              >
                <Circle className="w-4 h-4 text-gray-500 hover:text-primary-400" />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white text-sm truncate">
                    {task.title}
                  </h3>
                  {task.priority === "high" && (
                    <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 rounded text-xs">
                      High
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="text-xs text-gray-400 line-clamp-1 mb-1">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatEstimatedTime(task.estimated_time)}</span>

                  {task.station && (
                    <span className="ml-2 px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded-full text-xs">
                      {task.station}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-800">
        <a
          href="/admin/tasks"
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center justify-center"
        >
          View All Tasks
        </a>
      </div>
    </div>
  );
};
