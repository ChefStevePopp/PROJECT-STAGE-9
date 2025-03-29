import React from "react";
import { Plus, FileText } from "lucide-react";

const SpecSheets: React.FC = () => {
  return (
    <div className="card p-6">
      <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Specification Sheets
            </h2>
            <p className="text-gray-400">
              Create and manage detailed specification sheets for kitchen
              procedures and standards.
            </p>
          </div>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Spec Sheet
        </button>
      </div>
      <p className="text-gray-400 mb-6">
        Create and manage detailed specification sheets for kitchen procedures
        and standards.
      </p>
      <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
        <p className="text-gray-500">
          Spec sheet builder interface will be implemented here
        </p>
      </div>
    </div>
  );
};

export default SpecSheets;
