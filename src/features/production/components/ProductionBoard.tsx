import React from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const ProductionBoard = () => {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Production Board</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Pending
          </h2>
          {/* Pending tasks */}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            In Progress
          </h2>
          {/* In progress tasks */}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Completed
          </h2>
          {/* Completed tasks */}
        </div>
      </div>
    </div>
  );
};

export { ProductionBoard };
