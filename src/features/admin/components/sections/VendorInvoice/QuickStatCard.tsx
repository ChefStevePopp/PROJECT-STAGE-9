import React from 'react';

interface QuickStatCardProps {
  title: string; // e.g., "Items to Update"
  value: string | number; // e.g., "42" or "$1,234.56"
  trend?: string; // e.g., "+5 from last invoice"
  icon: React.ReactNode; // The Lucide icon to display
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'; // Color theme
}

export const QuickStatCard: React.FC<QuickStatCardProps> = ({
  title,
  value,
  trend,
  icon,
  color,
}) => {
  // Define dynamic classes for background and text colors
  const colorClasses = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    rose: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
  }[color];

  return (
    <div className="card p-6 hover:bg-gray-800/50 shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col sm:flex-row items-center sm:items-start gap-4">
      {/* Icon Section */}
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}
      >
        <span className="flex w-6 h-6 items-center justify-center">
          {React.cloneElement(icon as React.ReactElement, {
            className: `w-full h-full ${colorClasses.text}`,
          })}
        </span>
      </div>

      {/* Content Section */}
      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && <p className="text-sm text-gray-500">{trend}</p>}
      </div>
    </div>
  );
};

export const QuickStatCardGrid: React.FC<{ cards: QuickStatCardProps[] }> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <QuickStatCard key={index} {...card} />
      ))}
    </div>
  );
};
