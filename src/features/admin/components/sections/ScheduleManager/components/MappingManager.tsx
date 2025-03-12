import React, { useState, useEffect } from "react";
import {
  Save,
  Trash2,
  Edit,
  Plus,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { useScheduleMappingStore } from "@/stores/scheduleMappingStore";
import { ColumnMapping } from "./CSVConfiguration";
import toast from "react-hot-toast";

interface MappingManagerProps {
  onSelectMapping: (mapping: ColumnMapping) => void;
  onCreateMapping: () => void;
}

export const MappingManager: React.FC<MappingManagerProps> = ({
  onSelectMapping,
  onCreateMapping,
}) => {
  const { mappings, isLoading, error, fetchMappings, deleteMapping } =
    useScheduleMappingStore();
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  const handleSelectMapping = (mapping: ColumnMapping) => {
    setSelectedMappingId(mapping.id);
    onSelectMapping(mapping);
  };

  const handleDeleteMapping = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await deleteMapping(id);
        if (selectedMappingId === id) {
          setSelectedMappingId(null);
        }
      } catch (error) {
        console.error("Error deleting mapping:", error);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading mappings...</div>;
  }

  if (error) {
    return (
      <div className="bg-rose-500/10 text-rose-400 p-4 rounded-lg">
        Error loading mappings: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Saved Mappings</h3>
        <button onClick={onCreateMapping} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Mapping
        </button>
      </div>

      {mappings.length === 0 ? (
        <div className="text-center py-8 bg-gray-800/50 rounded-lg">
          <FileSpreadsheet className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No saved mappings found</p>
          <button
            onClick={onCreateMapping}
            className="mt-4 btn-ghost text-primary-400"
          >
            Create your first mapping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mappings.map((mapping) => (
            <div
              key={mapping.id}
              onClick={() => handleSelectMapping(mapping)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedMappingId === mapping.id ? "bg-primary-500/20 border border-primary-500/50" : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">{mapping.name}</h4>
                <button
                  onClick={(e) => handleDeleteMapping(mapping.id, e)}
                  className="text-gray-400 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-gray-400 mb-2">
                Format:{" "}
                {mapping.format.charAt(0).toUpperCase() +
                  mapping.format.slice(1)}
              </div>
              <div className="text-xs text-gray-500">
                {mapping.format === "standard" ? (
                  <span>
                    Maps: {mapping.employeeNameField || "Name"} →{" "}
                    {mapping.dateField || "Date"} →{" "}
                    {mapping.startTimeField || "Start"}/
                    {mapping.endTimeField || "End"}
                  </span>
                ) : mapping.format === "weekly" ? (
                  <span>
                    Maps: {mapping.employeeNameField || "Name"} → Weekly
                    schedule
                  </span>
                ) : (
                  <span>Custom mapping configuration</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
