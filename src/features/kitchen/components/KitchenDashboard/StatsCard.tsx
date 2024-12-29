import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'green' | 'yellow' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, color }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-medium text-white">{label}</h3>
          <p className="text-xl sm:text-2xl font-bold text-${color}-400">{value}</p>
        </div>
      </div>
    </div>
  );
};