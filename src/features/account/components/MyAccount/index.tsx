import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { YourKitchen } from './YourKitchen';
import { YourCrew } from './YourCrew';
import { YourStation } from './YourStation';

export const MyAccount: React.FC = () => {
  const [activeTab, setActiveTab] = useState('kitchen');
  const { user } = useAuth();

  const tabs = [
    { id: 'kitchen', label: 'Your Kitchen', color: 'primary' },
    { id: 'crew', label: 'Your Crew', color: 'green' },
    { id: 'station', label: 'Your Station', color: 'amber' }
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
        <p className="text-gray-400">Manage your profile and preferences</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${tab.color} ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'kitchen' && <YourKitchen />}
        {activeTab === 'crew' && <YourCrew />}
        {activeTab === 'station' && <YourStation />}
      </div>
    </div>
  );
};