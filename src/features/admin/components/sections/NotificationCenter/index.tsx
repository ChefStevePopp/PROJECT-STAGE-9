import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Package, Clock, MessageSquare, Calendar } from "lucide-react";

const NOTIFICATION_TYPES = [
  {
    id: "inventory",
    icon: Package,
    label: "Inventory Alerts",
    description: "Low stock and order reminders",
    defaultThreshold: 20,
  },
  {
    id: "prep",
    icon: Clock,
    label: "Prep Tasks",
    description: "Task assignments and reminders",
    defaultReminderHours: 2,
  },
  {
    id: "messages",
    icon: MessageSquare,
    label: "Team Messages",
    description: "Direct messages and mentions",
    defaultSound: true,
  },
  {
    id: "schedule",
    icon: Calendar,
    label: "Schedule Updates",
    description: "Shift changes and coverage",
    defaultConfirm: true,
  },
];

export const NotificationCenter: React.FC = () => {
  const { user, organization } = useAuth();
  const [config, setConfig] = React.useState({
    inventory: {
      enabled: true,
      threshold: 20,
      notifyRoles: ["sous_chef", "line_cook"],
    },
    prep: {
      enabled: true,
      reminderHours: 2,
    },
    messages: {
      enabled: true,
      sound: true,
    },
    schedule: {
      enabled: true,
      requireConfirmation: true,
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">
          Notification Settings
        </h1>
        <p className="text-gray-400">
          Configure how your team receives important updates
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {NOTIFICATION_TYPES.map((type) => (
          <div key={type.id} className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <type.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">{type.label}</h3>
                <p className="text-sm text-gray-400">{type.description}</p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Enable {type.label}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config[type.id].enabled}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        [type.id]: {
                          ...prev[type.id],
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              {/* Type-specific settings */}
              {type.id === "inventory" && (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">
                    Low Stock Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={config.inventory.threshold}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        inventory: {
                          ...prev.inventory,
                          threshold: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="input w-full"
                    min="1"
                    max="100"
                  />
                </div>
              )}

              {type.id === "prep" && (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-300">
                    Reminder Hours Before Due
                  </label>
                  <input
                    type="number"
                    value={config.prep.reminderHours}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        prep: {
                          ...prev.prep,
                          reminderHours: parseInt(e.target.value),
                        },
                      }))
                    }
                    className="input w-full"
                    min="1"
                    max="24"
                  />
                </div>
              )}

              {type.id === "messages" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    Sound Notifications
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.messages.sound}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          messages: {
                            ...prev.messages,
                            sound: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              )}

              {type.id === "schedule" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">
                    Require Confirmation
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.schedule.requireConfirmation}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            requireConfirmation: e.target.checked,
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="btn-primary px-6">Save Changes</button>
      </div>
    </div>
  );
};
