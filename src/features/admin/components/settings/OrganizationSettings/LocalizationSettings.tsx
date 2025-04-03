import React from "react";
import { Globe } from "lucide-react";
import type { Organization } from "@/types/organization";

interface LocalizationSettingsProps {
  organization: Organization;
  onChange: (updates: Partial<Organization>) => void;
}

export const LocalizationSettings: React.FC<LocalizationSettingsProps> = ({
  organization,
  onChange,
}) => {
  const updateSettings = (key: string, value: any) => {
    onChange({
      settings: {
        ...organization.settings,
        [key]: value,
      },
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Globe className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-lg font-medium text-white">
          Localization Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Currency
          </label>
          <select
            value={organization.settings?.currency || "CAD"}
            onChange={(e) => updateSettings("currency", e.target.value)}
            className="input w-full"
          >
            <option value="CAD">Canadian Dollar (CAD)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Date Format
          </label>
          <select
            value={organization.settings?.date_format || "MM/DD/YYYY"}
            onChange={(e) => updateSettings("date_format", e.target.value)}
            className="input w-full"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Time Format
          </label>
          <select
            value={organization.settings?.time_format || "12h"}
            onChange={(e) => updateSettings("time_format", e.target.value)}
            className="input w-full"
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Default Timezone
          </label>
          <select
            value={organization.settings?.default_timezone || ""}
            onChange={(e) => updateSettings("default_timezone", e.target.value)}
            className="input w-full"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Week Starts On
          </label>
          <select
            value={organization.settings?.weekStartsOn?.toString() || "1"}
            onChange={(e) =>
              updateSettings("weekStartsOn", parseInt(e.target.value))
            }
            className="input w-full"
          >
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="6">Saturday</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Multi-Unit Support
          </label>
          <select
            value={organization.settings?.multi_unit?.toString() || "false"}
            onChange={(e) =>
              updateSettings("multi_unit", e.target.value === "true")
            }
            className="input w-full"
          >
            <option value="false">Single Location</option>
            <option value="true">Multiple Locations</option>
          </select>
        </div>
      </div>
    </div>
  );
};
