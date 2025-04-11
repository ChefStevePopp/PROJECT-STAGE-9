import React, { useMemo, useEffect, useRef } from "react";
import { DndContext, DragEndEvent, closestCorners } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskColumn } from "./TaskColumn";
import { Task } from "@/types/tasks";
import { format, isToday, parseISO, addDays, subDays } from "date-fns";

interface KanbanBoardProps {
  showAdminView?: boolean;
  days: string[];
  tasks: Record<string, Task[]>;
  onTaskMove: (taskId: string, fromDay: string, toDay: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskAssign?: (taskId: string, assigneeId: string) => Promise<void>;
  onTaskSetForLottery?: (taskId: string) => Promise<void>;
  onDayClick?: (day: string) => void;
  onHeaderClick?: () => void;
  isDayView?: boolean;
  showAdminView?: boolean;
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
  showAdminView = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // DEBUG: Log the days and task counts
  console.log(`KanbanBoard rendering with ${days.length} days`);
  days.forEach((day) => {
    console.log(`Day ${day} has ${tasks[day]?.length || 0} tasks`);
  });

  // Calculate today, yesterday, and tomorrow dates for column sizing
  const dateInfo = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const yesterdayStr = format(subDays(today, 1), "yyyy-MM-dd");
    const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");

    return {
      today: todayStr,
      yesterday: yesterdayStr,
      tomorrow: tomorrowStr,
    };
  }, []);

  // Center the current day column on initial load
  useEffect(() => {
    if (!isDayView && containerRef.current) {
      // Find the index of today in the days array
      const todayIndex = days.findIndex((day) => day === dateInfo.today);

      if (todayIndex !== -1) {
        // Get all column elements
        const columns = containerRef.current.querySelectorAll(".card");

        if (columns.length > 0 && todayIndex < columns.length) {
          // Get the today column element
          const todayColumn = columns[todayIndex];

          // Calculate the position to center the today column
          const containerWidth = containerRef.current.clientWidth;
          const columnLeft =
            todayColumn.getBoundingClientRect().left -
            containerRef.current.getBoundingClientRect().left;
          const columnWidth = todayColumn.clientWidth;

          // Set scroll position to center the today column
          const scrollPosition =
            columnLeft - containerWidth / 2 + columnWidth / 2;
          containerRef.current.scrollLeft = scrollPosition;
        }
      }
    }
  }, [days, dateInfo.today, isDayView]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract task ID and day from the combined ID (format: taskId:day:index)
    const [taskId, fromDay] = activeId.split(":").slice(0, 2);
    const [_, toDay] = overId.split(":").slice(0, 2);

    if (fromDay !== toDay) {
      onTaskMove(taskId, fromDay, toDay);
    }
  };

  // Determine column type for styling
  const getColumnType = (day: string) => {
    if (day === dateInfo.today) return "today";
    if (day === dateInfo.yesterday) return "adjacent";
    if (day === dateInfo.tomorrow) return "adjacent";
    return "overflow";
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      {isDayView ? (
        // Day view - single column layout
        <div className="grid grid-cols-1 gap-6 w-full">
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
              showAdminView={showAdminView}
              columnType="today"
              className=""
            />
          ))}
        </div>
      ) : (
        // Week view - custom layout with overflow and slider controls
        <div className="relative w-full pb-4">
          <div
            ref={containerRef}
            className="flex overflow-x-auto gap-6 w-full h-[80vh] relative"
            id="kanban-scroll-container"
          >
            {days.map((day) => {
              const columnType = getColumnType(day);
              return (
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
                  showAdminView={showAdminView}
                  columnType={columnType}
                  className={`
                    ${columnType === "today" ? "w-[40%] min-w-[350px] flex-shrink-0" : ""}
                    ${columnType === "adjacent" ? "w-[30%] min-w-[250px] flex-shrink-0" : ""}
                    ${columnType === "overflow" ? "min-w-[220px] flex-shrink-0" : ""}
                  `}
                />
              );
            })}
          </div>

          {/* Slider control buttons */}
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg z-10"
            onClick={() => {
              const container = document.getElementById(
                "kanban-scroll-container",
              );
              if (container)
                container.scrollBy({ left: -300, behavior: "smooth" });
            }}
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg z-10"
            onClick={() => {
              const container = document.getElementById(
                "kanban-scroll-container",
              );
              if (container)
                container.scrollBy({ left: 300, behavior: "smooth" });
            }}
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </DndContext>
  );
};
