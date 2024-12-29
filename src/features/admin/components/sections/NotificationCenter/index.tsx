import React, { useState } from 'react';
import { Bell, Settings } from 'lucide-react';
import { NotificationSettings } from './NotificationSettings';

export const NotificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'settings'>('settings');

  const tabs = [
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'settings' as const, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-medium text-white mb-2">Notification Center</h1>
        <p className="text-sm text-gray-400">Manage your notification preferences and view recent alerts</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'settings' ? (
          <NotificationSettings />
        ) : (
          <div className="card p-4">
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-400">No new notifications</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};