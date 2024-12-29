import React from 'react';
import { ClipboardList, Plus, Search } from 'lucide-react';

export const TaskManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Task Management</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create Task
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-yellow-400" />
            Pending
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-white">Prep Mise en Place</h3>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                  High
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Complete station prep before service
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Due: 2:00 PM</span>
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                  alt="Assigned to"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            In Progress
          </h2>
          <div className="space-y-4">
            {/* Task cards will be mapped here */}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-400" />
            Completed
          </h2>
          <div className="space-y-4">
            {/* Task cards will be mapped here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManagement;