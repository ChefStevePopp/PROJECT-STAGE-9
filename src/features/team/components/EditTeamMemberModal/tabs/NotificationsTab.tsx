import React from "react";
import { Bell, MessageSquare, Mail, Phone, AlertTriangle } from "lucide-react";
import type { TeamMember } from "../../../types";

interface NotificationsTabProps {
  formData: TeamMember;
  setFormData: (data: TeamMember) => void;
}

const NOTIFICATION_TYPES = [
  {
    id: "schedule_changes",
    label: "Schedule Changes",
    description: "Notifications about shift changes and updates",
  },
  {
    id: "team_updates",
    label: "Team Updates",
    description: "Important team announcements and updates",
  },
  {
    id: "recipe_changes",
    label: "Recipe Changes",
    description: "Updates to recipes and preparation methods",
  },
  {
    id: "inventory_alerts",
    label: "Inventory Alerts",
    description: "Low stock and inventory-related notifications",
  },
];

const CHANNELS = [
  { id: "app", label: "In-App", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "sms", label: "SMS", icon: Phone },
];

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  formData,
  setFormData,
}) => {
  const preferences = formData.notification_preferences || {};

  const updatePreference = (type: string, channel: string, value: boolean) => {
    setFormData({
      ...formData,
      notification_preferences: {
        ...preferences,
        [type]: {
          ...(preferences[type] || {}),
          [channel]: value,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Notification Preferences
          </h3>
        </div>

        <div className="space-y-4">
          {NOTIFICATION_TYPES.map((type) => (
            <div key={type.id} className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-400">{type.description}</p>
                </div>
              </div>

              <div className="flex gap-4 mt-3">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  const isEnabled = preferences[type.id]?.[channel.id] ?? true;

                  return (
                    <label
                      key={channel.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) =>
                          updatePreference(
                            type.id,
                            channel.id,
                            e.target.checked,
                          )
                        }
                        className="checkbox"
                      />
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {channel.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-rose-500/10 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-rose-400">
              Important Notice
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Critical system notifications and security alerts cannot be
              disabled and will always be sent to your primary email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
