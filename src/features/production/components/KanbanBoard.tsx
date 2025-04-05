import React from "react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskColumn } from "./TaskColumn";
import { Task } from "@/types/tasks";

interface KanbanBoardProps {
  days: string[];
  tasks: Record<string, Task[]>;
  onTaskMove: (taskId: string, fromDay: string, toDay: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskAssign?: (taskId: string, assigneeId: string) => Promise<void>;
  onTaskSetForLottery?: (taskId: string) => Promise<void>;
  onDayClick?: (day: string) => void;
  onHeaderClick?: () => void;
  isDayView?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  days,
  tasks,
  onTaskMove,
  onTaskComplete,
  onTaskAssign,
  onTaskSetForLottery,
  onDayClick,
  onHeaderClick,
  isDayView = false,
}) => {
  // DEBUG: Log the days and task counts
  console.log(`KanbanBoard rendering with ${days.length} days`);
  days.forEach((day) => {
    console.log(`Day ${day} has ${tasks[day]?.length || 0} tasks`);
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract task ID and day from the combined ID
    // Extract task ID and day from the combined ID (format: taskId:day:index)
    const [taskId, fromDay] = activeId.split(":").slice(0, 2);
    const [_, toDay] = overId.split(":").slice(0, 2);

    if (fromDay !== toDay) {
      onTaskMove(taskId, fromDay, toDay);
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div
        className={`grid grid-cols-1 ${isDayView ? "" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7"} gap-6 w-full`}
      >
        {days.map((day) => (
          <TaskColumn
            key={day}
            day={day}
            tasks={tasks[day] || []}
            onTaskComplete={onTaskComplete}
            onTaskAssign={onTaskAssign}
            onTaskSetForLottery={onTaskSetForLottery}
            onDayClick={onDayClick ? () => onDayClick(day) : undefined}
            onHeaderClick={onHeaderClick}
            isDayView={isDayView}
            className=""
          />
        ))}
      </div>
    </DndContext>
  );
};
