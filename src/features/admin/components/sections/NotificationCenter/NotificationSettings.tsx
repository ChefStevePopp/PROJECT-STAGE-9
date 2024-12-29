import React, { useState } from 'react';
import { Bell, MessageSquare, Calendar, AlertTriangle } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  mobile: boolean;
  email: boolean;
}

interface NotificationToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2">
    <div className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
    </div>
    <span className="text-xs text-gray-400">{label}</span>
  </label>
);

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'announcements',
      title: 'Announcements',
      description: 'Get notified about important team announcements',
      icon: <Bell className="w-4 h-4" />,
      mobile: true,
      email: true
    },
    {
      id: 'messages',
      title: 'Team Messages',
      description: 'Receive notifications for team chat messages',
      icon: <MessageSquare className="w-4 h-4" />,
      mobile: true,
      email: false
    },
    {
      id: 'schedule',
      title: 'Schedule Updates',
      description: 'Get notified about changes to your schedule',
      icon: <Calendar className="w-4 h-4" />,
      mobile: true,
      email: true
    },
    {
      id: 'alerts',
      title: 'System Alerts',
      description: 'Receive important system alerts and warnings',
      icon: <AlertTriangle className="w-4 h-4" />,
      mobile: true,
      email: true
    }
  ]);

  const handleToggle = (id: string, type: 'mobile' | 'email') => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, [type]: !setting[type] }
          : setting
      )
    );
  };

  return (
    <div className="card p-6 space-y-6">
      <div className="space-y-4">
        {settings.map(setting => (
          <div
            key={setting.id}
            className="flex flex-col sm:flex-row sm:items-start justify-between py-2 gap-4"
          >
            <div className="flex gap-3 flex-1">
              <div className="mt-0.5 text-gray-400">
                {setting.icon}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{setting.title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
              </div>
            </div>
            <div className="flex flex-row gap-3 pt-2 sm:pt-0">
              <NotificationToggle
                checked={setting.mobile}
                onChange={() => handleToggle(setting.id, 'mobile')}
                label="Mobile"
              />
              <NotificationToggle
                checked={setting.email}
                onChange={() => handleToggle(setting.id, 'email')}
                label="Email"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};