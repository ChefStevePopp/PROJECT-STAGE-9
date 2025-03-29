import React from "react";
import { Plus, Sunrise } from "lucide-react";

const OpeningChecklists: React.FC = () => {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
            <Sunrise className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Opening Checklists
            </h2>
            <p className="text-gray-400">
              Create and manage checklists for kitchen opening procedures.
            </p>
          </div>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Checklist
        </button>
      </div>
      <p className="text-gray-400 mb-6">
        Create and manage checklists for kitchen opening procedures.
      </p>
      <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
        <p className="text-gray-500">
          Opening checklist builder interface will be implemented here
        </p>
      </div>
    </div>
  );
};

export default OpeningChecklists;
