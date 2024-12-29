import React, { useState } from 'react';
import { Clock, Calendar, ChefHat } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
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

export const YourCrew: React.FC = () => {
  const [generalNotifications, setGeneralNotifications] = useState<NotificationSetting[]>([
    {
      id: 'schedule',
      title: 'Schedule Updates',
      description: 'Get notified about changes to your schedule',
      mobile: true,
      email: true
    },
    {
      id: 'team',
      title: 'Team Messages',
      description: 'Receive notifications for team chat messages',
      mobile: true,
      email: false
    },
    {
      id: 'prep',
      title: 'Prep Tasks',
      description: 'Get notified when prep tasks are assigned to you',
      mobile: true,
      email: false
    }
  ]);

  const handleToggle = (id: string, type: 'mobile' | 'email') => {
    setGeneralNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, [type]: !notification[type] }
          : notification
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Communication Preferences</h3>
        <div className="space-y-4">
          {generalNotifications.map(notification => (
            <div
              key={notification.id}
              className="flex flex-col sm:flex-row sm:items-start justify-between p-4 bg-gray-800/50 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="text-white font-medium">{notification.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{notification.description}</p>
              </div>
              <div className="flex flex-row gap-4 pt-2 sm:pt-0">
                <NotificationToggle
                  checked={notification.mobile}
                  onChange={() => handleToggle(notification.id, 'mobile')}
                  label="Mobile"
                />
                <NotificationToggle
                  checked={notification.email}
                  onChange={() => handleToggle(notification.id, 'email')}
                  label="Email"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-white mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Emergency contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              className="input w-full"
              placeholder="Emergency contact number"
            />
          </div>
        </div>
      </div>
    </div>
  );
};