import React from "react";
import { Settings, Globe, Clock, Calendar, AlertTriangle } from "lucide-react";
import type { TeamMember } from "../../../types";

interface SettingsTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  formData,
  setFormData,
}) => {
  const settings = formData.settings || {};

  const updateSetting = (key: string, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Language & Region
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Preferred Language
            </label>
            <select
              value={settings.language || "en"}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="input w-full"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Time Zone
            </label>
            <select
              value={settings.timezone || "America/New_York"}
              onChange={(e) => updateSetting("timezone", e.target.value)}
              className="input w-full"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Preferences */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Schedule Preferences
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Preferred Shift
            </label>
            <select
              value={settings.preferred_shift || "any"}
              onChange={(e) => updateSetting("preferred_shift", e.target.value)}
              className="input w-full"
            >
              <option value="any">No Preference</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Maximum Hours per Week
            </label>
            <input
              type="number"
              value={settings.max_hours_per_week || 40}
              onChange={(e) =>
                updateSetting("max_hours_per_week", parseInt(e.target.value))
              }
              className="input w-full"
              min="0"
              max="168"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="weekend_availability"
              checked={settings.weekend_availability || false}
              onChange={(e) =>
                updateSetting("weekend_availability", e.target.checked)
              }
              className="checkbox"
            />
            <label
              htmlFor="weekend_availability"
              className="text-sm text-gray-300"
            >
              Available for weekend shifts
            </label>
          </div>
        </div>
      </div>

      {/* Calendar Integration */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Calendar Integration
          </h3>
        </div>

        <div className="bg-purple-500/10 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-purple-400">
                Calendar Sync Coming Soon
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                Calendar integration with popular services like Google Calendar
                and Outlook will be available in a future update.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
