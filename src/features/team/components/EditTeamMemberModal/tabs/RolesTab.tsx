import React, { useState, useEffect } from "react";
import { Plus, Trash2, ChefHat, Briefcase, Building2 } from "lucide-react";
import type { TeamMember } from "../../../types";
import { supabase } from "@/lib/supabase";

interface RolesTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const RolesTab: React.FC<RolesTabProps> = ({
  formData,
  setFormData,
}) => {
  const [kitchenStations, setKitchenStations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch kitchen stations from operations_settings
  useEffect(() => {
    const fetchKitchenStations = async () => {
      setIsLoading(true);
      try {
        // Get the organization ID from the current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const organizationId = user?.user_metadata?.organizationId;

        if (!organizationId) {
          console.error("No organization ID found");
          return;
        }

        // Fetch operations settings
        const { data, error } = await supabase
          .from("operations_settings")
          .select("kitchen_stations")
          .eq("organization_id", organizationId)
          .single();

        if (error) {
          console.error("Error fetching operations settings:", error);
          return;
        }

        // Extract kitchen stations
        const stations = data?.kitchen_stations || [];
        setKitchenStations(stations);
      } catch (error) {
        console.error("Error fetching kitchen stations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKitchenStations();
  }, []);

  const addWorkstationRole = () => {
    setFormData({
      ...formData,
      roles: [...(formData.roles || []), ""],
    });
  };

  const updateWorkstationRole = (index: number, value: string) => {
    const newRoles = [...(formData.roles || [])];
    newRoles[index] = value;
    setFormData({ ...formData, roles: newRoles });
  };

  const removeWorkstationRole = (index: number) => {
    const newRoles = [...(formData.roles || [])];
    newRoles.splice(index, 1);
    setFormData({ ...formData, roles: newRoles });
  };

  const handleStationToggle = (station: string) => {
    const currentStations = [...(formData.kitchen_stations || [])];
    const stationIndex = currentStations.indexOf(station);

    if (stationIndex >= 0) {
      currentStations.splice(stationIndex, 1);
    } else {
      currentStations.push(station);
    }

    setFormData({ ...formData, kitchen_stations: currentStations });
  };

  // Department functions
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
      {/* Departments Section */}
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

        <div className="bg-amber-500/10 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-400">
                About Departments
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Departments help organize team members into functional groups. A
                team member can belong to multiple departments and will receive
                notifications and updates relevant to their assigned
                departments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Team Roles */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Scheduled Team Role(s)
          </h3>
        </div>

        <div className="bg-green-500/10 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300">
            These roles are used for scheduling purposes and represent the team
            member's position in the kitchen schedule. A team member can have
            multiple roles for different shifts.
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-gray-400">Assigned Roles</h4>
          <button
            type="button"
            onClick={addWorkstationRole}
            className="text-green-400 hover:text-green-300 p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {(formData.roles || []).map((role, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={role}
                onChange={(e) => updateWorkstationRole(index, e.target.value)}
                className="input flex-1 text-sm"
                placeholder="Enter role (e.g., Line Cook, Prep Cook, Dishwasher)"
              />
              <button
                type="button"
                onClick={() => removeWorkstationRole(index)}
                className="text-gray-400 hover:text-rose-400 p-2 hover:bg-gray-800/50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {(formData.roles || []).length === 0 && (
            <div className="text-sm text-gray-500 text-center py-2">
              No scheduled roles added
            </div>
          )}
        </div>
      </div>

      {/* Kitchen Stations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ChefHat className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Kitchen Stations
          </h3>
        </div>

        <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300">
            Kitchen stations represent the physical areas in the kitchen where
            this team member is trained to work. These stations are configured
            in Organization Settings and are used for scheduling and task
            assignments.
          </p>
        </div>

        {isLoading ? (
          <div className="p-4 bg-gray-800/50 rounded-lg text-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 text-sm mt-2">Loading stations...</p>
          </div>
        ) : kitchenStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {kitchenStations.map((station) => (
              <div
                key={station}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h5 className="font-medium text-white">{station}</h5>
                  </div>
                </div>
                <div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={(formData.kitchen_stations || []).includes(
                        station,
                      )}
                      onChange={() => handleStationToggle(station)}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-800/50 rounded-lg text-center">
            <p className="text-gray-400 text-sm">
              No kitchen stations configured. Add stations in Organization
              Settings under Operations Variables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
