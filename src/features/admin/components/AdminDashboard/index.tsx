import React from 'react';
import { Users, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { StatsCard } from '../StatsCard';
import { ActivityFeed } from '../ActivityFeed';
import { AlertsList } from '../AlertsList';

export function AdminDashboard() {
  const { stats, activities, alerts } = useAdminStore();

  const statsCards = [
    { 
      icon: Users, 
      label: 'Active Staff', 
      value: stats.activeStaff, 
      change: '+2', 
      color: 'blue' 
    },
    { 
      icon: Package, 
      label: 'Low Stock Items', 
      value: stats.lowStockItems, 
      change: '-3', 
      color: 'yellow' 
    },
    { 
      icon: AlertTriangle, 
      label: 'Pending Tasks', 
      value: stats.pendingTasks, 
      change: '+5', 
      color: 'orange' 
    },
    { 
      icon: TrendingUp, 
      label: 'Prep Completion', 
      value: `${stats.prepCompletion}%`, 
      change: '+12%', 
      color: 'green' 
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={activities} />
        <AlertsList alerts={alerts} />
      </div>
    </div>
  );
}