import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Plus, Building2, Clock, Users, Settings } from "lucide-react";

export const LocationDetails: React.FC = () => {
  const { organization } = useAuth();
  const [locations, setLocations] = useState(
    organization.settings?.locations || [],
  );

  const addLocation = () => {
    const newLocation = {
      id: `loc-${Date.now()}`,
      name: "",
      address: "",
      phone: "",
      manager: "",
      operating_hours: {},
      equipment_profile: [],
      cost_center: "",
    };

    setLocations([...locations, newLocation]);
  };

  return (
    <div className="space-y-6">
      {/* Multi-Location Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
        <div>
          <h3 className="text-white font-medium">Multi-Location Management</h3>
          <p className="text-sm text-gray-400 mt-1">
            Enable management of multiple locations
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={organization.settings?.multi_unit}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
        </label>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {locations.map((location: any) => (
          <div
            key={location.id}
            className="p-4 bg-gray-800/50 rounded-lg space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={location.name}
                  className="input w-full"
                  placeholder="Enter location name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={location.address}
                  className="input w-full"
                  placeholder="Enter address"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={location.phone}
                  className="input w-full"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Manager */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Location Manager
                </label>
                <input
                  type="text"
                  value={location.manager}
                  className="input w-full"
                  placeholder="Enter manager name"
                />
              </div>

              {/* Cost Center */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Cost Center
                </label>
                <input
                  type="text"
                  value={location.cost_center}
                  className="input w-full"
                  placeholder="Enter cost center"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button className="btn-ghost text-sm">
                <Clock className="w-4 h-4 mr-2" />
                Operating Hours
              </button>
              <button className="btn-ghost text-sm">
                <Settings className="w-4 h-4 mr-2" />
                Equipment Profile
              </button>
              <button className="btn-ghost text-sm">
                <Users className="w-4 h-4 mr-2" />
                Staff Assignment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Location Button */}
      <button
        onClick={addLocation}
        className="w-full py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-primary-500/50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add Location
      </button>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  );
};
