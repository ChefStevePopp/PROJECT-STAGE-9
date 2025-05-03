import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { Task } from "@/types/tasks";
import { format, isToday, parseISO, differenceInDays } from "date-fns";

type ColumnType = "today" | "adjacent" | "overflow";

interface TaskColumnProps {
  showAdminView?: boolean;
  day: string;
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onTaskAssign?: (taskId: string, assigneeId: string) => Promise<void>;
  onTaskSetForLottery?: (taskId: string) => Promise<void>;
  onDayClick?: () => void;
  onHeaderClick?: () => void;
  isDayView?: boolean;
  onUpdatePrepSystem?: (
    taskId: string,
    system: "par" | "as_needed" | "scheduled_production" | "hybrid",
  ) => Promise<void>;
  onUpdateAmount?: (taskId: string, amount: number) => Promise<void>;
  onUpdateParLevel?: (taskId: string, parLevel: number) => Promise<void>;
  onUpdateCurrentLevel?: (
    taskId: string,
    currentLevel: number,
  ) => Promise<void>;
  className?: string;
  columnType?: ColumnType;
  showAdminView?: boolean;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  day,
  tasks,
  onTaskComplete,
  onTaskAssign,
  onTaskSetForLottery,
  onDayClick,
  onHeaderClick,
  isDayView = false,
  onUpdatePrepSystem,
  onUpdateAmount,
  onUpdateParLevel,
  onUpdateCurrentLevel,
  className = "",
  columnType = "overflow",
  showAdminView = false,
}) => {
  const { setNodeRef } = useDroppable({
    id: `column:${day}`,
  });

  const date = parseISO(day);
  const formattedDay = format(date, "EEE");
  const formattedDate = format(date, "MMM d");
  const isCurrentDay = isToday(date);
  const today = new Date();

  // Process tasks to add calculated fields and clean up descriptions
  const processedTasks = tasks.map((task) => {
    // Calculate days late if the task is not completed and past due date
    const dueDate = task.due_date
      ? new Date(task.due_date)
      : new Date(task.created_at);
    const isLate = !task.completed && dueDate < today;
    const daysLate = isLate ? differenceInDays(today, dueDate) : 0;

    // Clean up description by removing auto-advance messages
    const cleanedDescription = task.description
      ? task.description.replace(/\s*\[Auto-advanced from.*?\]/g, "")
      : task.description;

    return {
      ...task,
      isLate,
      daysLate,
      description: cleanedDescription,
    };
  });

  // Create a list of task IDs for SortableContext
  // Ensure each ID is unique by adding an index to prevent duplicates
  const taskIds = processedTasks.map(
    (task, index) => `${task.id}:${day}:${index}`,
  );

  // Determine which click handler to use
  const handleHeaderClick = isDayView ? onHeaderClick : onDayClick;

  return (
    <div
      ref={setNodeRef}
      className={`card p-4 h-full min-h-[500px] ${isCurrentDay ? "border-2 border-primary-500" : ""} ${columnType === "today" ? "bg-gray-800" : columnType === "adjacent" ? "bg-gray-900/90" : "bg-gray-900/70"} ${className}`}
    >
      <div
        className={
          `text-lg font-semibold mb-4 border-b border-gray-700 ${isCurrentDay ? "text-primary-400" : "text-white"} ${handleHeaderClick ? "cursor-pointer hover:bg-gray-700/20 transition-colors rounded-t -m-2 mt-[-16px] mx-[-16px]" : ""}` +
          " p-2"
        }
        onClick={handleHeaderClick}
        title={
          isDayView ? "Click to return to week view" : "Click to view this day"
        }
      >
        <div className="flex justify-between items-center px-2">
          <span>{formattedDay}</span>
          <span className="text-sm text-slate-300 bg-slate-700 border border-slate-400 px-2 py-0.5 rounded-full">
            {processedTasks.length}
          </span>
        </div>
        <div className="text-sm text-slate-300 text-left px-2">
          {formattedDate}
        </div>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {processedTasks.length > 0 ? (
            processedTasks.map((task) => {
              return (
                <SortableTaskCard
                  key={`${task.id}:${day}:${processedTasks.indexOf(task)}`}
                  id={`${task.id}:${day}:${processedTasks.indexOf(task)}`}
                  task={task}
                  onComplete={onTaskComplete}
                  onAssign={
                    onTaskAssign ||
                    (async (taskId, assigneeId) => {
                      console.error(
                        "No onAssign handler provided to TaskColumn",
                      );
                      return Promise.reject(
                        new Error("No onAssign handler provided"),
                      );
                    })
                  }
                  onSetForLottery={
                    onTaskSetForLottery ||
                    (async (taskId) => {
                      console.error(
                        "No onSetForLottery handler provided to TaskColumn",
                      );
                      return Promise.reject(
                        new Error("No onSetForLottery handler provided"),
                      );
                    })
                  }
                  onUpdatePrepSystem={onUpdatePrepSystem}
                  onUpdateAmount={onUpdateAmount}
                  onUpdatePar={onUpdateParLevel}
                  onUpdateCurrent={onUpdateCurrentLevel}
                  showAdminView={showAdminView}
                  isDayView={isDayView}
                />
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p>No tasks for this day</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
