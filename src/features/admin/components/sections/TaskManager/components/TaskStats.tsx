import React, { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  BarChart3,
} from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";

export const TaskStats: React.FC = () => {
  const { tasks } = useTaskStore();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const todayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.due_date).toISOString().split("T")[0];
      return taskDate === today && !task.completed;
    }).length;
    const overdueTasks = tasks.filter((task) => {
      const taskDate = new Date(task.due_date).toISOString().split("T")[0];
      return taskDate < today && !task.completed;
    }).length;

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      todayTasks,
      overdueTasks,
      completionRate,
    };
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <Clock className="w-6 h-6 text-primary-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Today's Tasks</h3>
          <p className="text-2xl font-bold text-white">{stats.todayTasks}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Completed</h3>
          <p className="text-2xl font-bold text-white">
            {stats.completedTasks}
          </p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Overdue</h3>
          <p className="text-2xl font-bold text-white">{stats.overdueTasks}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-400">Completion Rate</h3>
          <p className="text-2xl font-bold text-white">
            {stats.completionRate}%
          </p>
        </div>
      </div>
    </div>
  );
};
