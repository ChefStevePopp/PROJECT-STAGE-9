import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { Task } from "@/types/tasks";
import { format, isToday, parseISO } from "date-fns";

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
  // DEBUG: Log the tasks for this column
  // console.log(`TaskColumn for ${day} rendering with ${tasks.length} tasks`);
  const { setNodeRef } = useDroppable({
    id: `column:${day}`,
  });

  const date = parseISO(day);
  const formattedDay = format(date, "EEE");
  const formattedDate = format(date, "MMM d");
  const isCurrentDay = isToday(date);

  // Create a list of task IDs for SortableContext
  // Ensure each ID is unique by adding an index to prevent duplicates
  const taskIds = tasks.map((task, index) => `${task.id}:${day}:${index}`);

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
          <span className="text-sm bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="text-sm text-gray-400 text-left px-2">
          {formattedDate}
        </div>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              // console.log(`Rendering task in column ${day}:`, task);
              return (
                <SortableTaskCard
                  key={`${task.id}:${day}:${tasks.indexOf(task)}`}
                  id={`${task.id}:${day}:${tasks.indexOf(task)}`}
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
