import React from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
import type { TeamMember } from "../../../types";

interface DepartmentsTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const DepartmentsTab: React.FC<DepartmentsTabProps> = ({
  formData,
  setFormData,
}) => {
  const addDepartment = () => {
    setFormData({
      ...formData,
      departments: [...(formData.departments || []), ""],
    });
  };

  const updateDepartment = (index: number, value: string) => {
    const newDepartments = [...(formData.departments || [])];
    newDepartments[index] = value;
    setFormData({ ...formData, departments: newDepartments });
  };

  const removeDepartment = (index: number) => {
    const newDepartments = [...(formData.departments || [])];
    newDepartments.splice(index, 1);
    setFormData({ ...formData, departments: newDepartments });
  };

  return (
    <div className="space-y-6">
      {/* Department List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-gray-300">Departments</h3>
          </div>
          <button
            type="button"
            onClick={addDepartment}
            className="text-amber-400 hover:text-amber-300 p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {(formData.departments || []).map((dept, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={dept}
                onChange={(e) => updateDepartment(index, e.target.value)}
                className="input flex-1 text-sm"
                placeholder="Enter department name"
              />
              <button
                type="button"
                onClick={() => removeDepartment(index)}
                className="text-gray-400 hover:text-rose-400 p-2 hover:bg-gray-800/50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(formData.departments || []).length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              No departments assigned
            </div>
          )}
        </div>
      </div>

      {/* Department Info */}
      <div className="bg-amber-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-amber-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-400">
              About Departments
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Departments help organize team members into functional groups. A
              team member can belong to multiple departments and will receive
              notifications and updates relevant to their assigned departments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
