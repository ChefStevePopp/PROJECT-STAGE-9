import React, { useState } from "react";
import {
  ClipboardList,
  Plus,
  Sunrise,
  ClipboardCheck,
  Sunset,
  FileText,
  ListChecks,
} from "lucide-react";

export const ChecklistsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("opening");

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/admin/components/sections/ChecklistsManager/index.tsx
      </div>

      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Checklists & Spec Sheets
          </h1>
          <p className="text-gray-400">
            Create and manage operational checklists and specifications
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create Checklist
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("opening")}
          className={`tab primary ${activeTab === "opening" ? "active" : ""}`}
        >
          <Sunrise className="w-5 h-5" />
          Opening Checklists
        </button>
        <button
          onClick={() => setActiveTab("closing")}
          className={`tab green ${activeTab === "closing" ? "active" : ""}`}
        >
          <Sunset className="w-5 h-5" />
          Closing Checklists
        </button>
        <button
          onClick={() => setActiveTab("spec-sheets")}
          className={`tab amber ${activeTab === "spec-sheets" ? "active" : ""}`}
        >
          <FileText className="w-5 h-5" />
          Spec Sheets
        </button>
        <button
          onClick={() => setActiveTab("list-builder")}
          className={`tab rose ${activeTab === "list-builder" ? "active" : ""}`}
        >
          <ListChecks className="w-5 h-5" />
          List Builder
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "opening" && (
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
      )}

      {activeTab === "closing" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Sunset className="h-5 w-5 text-green-500" />
              </div>
              <h2 className="text-xl font-medium">Closing Checklists</h2>
            </div>
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Checklist
            </button>
          </div>
          <p className="text-gray-400 mb-6">
            Create and manage checklists for kitchen closing procedures.
          </p>
          <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <p className="text-gray-500">
              Closing checklist builder interface will be implemented here
            </p>
          </div>
        </div>
      )}

      {activeTab === "spec-sheets" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-medium">Specification Sheets</h2>
            </div>
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Spec Sheet
            </button>
          </div>
          <p className="text-gray-400 mb-6">
            Create and manage detailed specification sheets for kitchen
            procedures and standards.
          </p>
          <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <p className="text-gray-500">
              Spec sheet builder interface will be implemented here
            </p>
          </div>
        </div>
      )}

      {activeTab === "list-builder" && (
        <div className="card p-6">
          <div className="flex justify-between items-center rounded-lg p-6 mb-4 bg-[#1a1f2b] shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600/20 rounded-lg flex items-center justify-center">
                <ListChecks className="h-5 w-5 text-rose-500" />
              </div>
              <h2 className="text-xl font-medium">List Builder</h2>
            </div>
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </button>
          </div>
          <p className="text-gray-400 mb-6">
            Create custom lists for various kitchen management needs.
          </p>
          <div className="p-8 border border-dashed border-gray-700 rounded-lg bg-gray-800/50 flex items-center justify-center">
            <p className="text-gray-500">
              Custom list builder interface will be implemented here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistsManager;
