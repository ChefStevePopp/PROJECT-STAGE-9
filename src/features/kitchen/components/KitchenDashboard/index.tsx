import React from 'react';
import { ThumbsUp, AlertTriangle, ChefHat } from 'lucide-react';
import { useTeamStore } from '@/stores/teamStore';
import { StatsCard } from './StatsCard';
import { PrepList } from './PrepList';
import { StaffSchedule } from './StaffSchedule';

export const KitchenDashboard: React.FC = () => {
  const team = useTeamStore(state => state.members);

  const stats = [
    {
      icon: ThumbsUp,
      label: 'Prep Status',
      value: '85%',
      color: 'green' as const
    },
    {
      icon: AlertTriangle,
      label: 'Low Stock Items',
      value: '8',
      color: 'yellow' as const
    },
    {
      icon: ChefHat,
      label: 'Staff On Duty',
      value: team.length,
      color: 'blue' as const
    }
  ];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-orange to-accent-yellow bg-clip-text text-transparent">
          Kitchen Dashboard Index1
        </h1>
        <div className="text-xl font-medium text-white">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrepList />
        <StaffSchedule team={team} />
      </div>
    </div>
  );
};