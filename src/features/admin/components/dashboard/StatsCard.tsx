import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change: string;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, change, color }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{value}</p>
            <span className={`text-xs ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
              {change}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;