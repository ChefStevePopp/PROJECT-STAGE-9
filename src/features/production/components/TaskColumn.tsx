import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTaskCard } from "./SortableTaskCard";
import { Task } from "@/types/tasks";
import { format, isToday, parseISO } from "date-fns";

interface TaskColumnProps {
  day: string;
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  day,
  tasks,
  onTaskComplete,
}) => {
  const { setNodeRef } = useDroppable({
    id: `column:${day}`,
  });

  const date = parseISO(day);
  const formattedDay = format(date, "EEE");
  const formattedDate = format(date, "MMM d");
  const isCurrentDay = isToday(date);

  // Create a list of task IDs for SortableContext
  const taskIds = tasks.map((task) => `${task.id}:${day}`);

  return (
    <div
      ref={setNodeRef}
      className={`card p-4 h-full min-h-[500px] ${isCurrentDay ? "border-2 border-primary-500" : ""}`}
    >
      <div
        className={`text-lg font-semibold mb-4 pb-2 border-b border-gray-700 ${isCurrentDay ? "text-primary-400" : "text-white"}`}
      >
        <div className="flex justify-between items-center">
          <span>{formattedDay}</span>
          <span className="text-sm bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="text-sm text-gray-400">{formattedDate}</div>
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <SortableTaskCard
                key={`${task.id}:${day}`}
                id={`${task.id}:${day}`}
                task={task}
                onComplete={onTaskComplete}
              />
            ))
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
