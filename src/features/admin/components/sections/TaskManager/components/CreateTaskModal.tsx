import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Tag } from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";
import { useOperationsStore } from "@/stores/operationsStore";
import { TeamMember } from "@/features/team/types";
import toast from "react-hot-toast";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: TeamMember[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [station, setStation] = useState("");
  const [priority, setPriority] = useState("medium");
  const [estimatedTime, setEstimatedTime] = useState(30); // in minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTask } = useTaskStore();
  const { settings, fetchSettings } = useOperationsStore();

  useEffect(() => {
    fetchSettings();
    // Set default due date to today
    setDueDate(new Date().toISOString().split("T")[0]);
  }, [fetchSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        title,
        description,
        due_date: dueDate,
        assignee_id: assigneeId,
        station,
        priority,
        estimated_time: estimatedTime,
        completed: false,
      });

      toast.success("Task created successfully");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date().toISOString().split("T")[0]);
    setAssigneeId("");
    setStation("");
    setPriority("medium");
    setEstimatedTime(30);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-medium text-white">Create New Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Due Date <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="date"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Assignee
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Station */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Station
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={station}
                onChange={(e) => setStation(e.target.value)}
              >
                <option value="">Select Station</option>
                {settings?.kitchen_stations?.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Priority
              </label>
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Estimated Time (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="number"
                  min="5"
                  step="5"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
