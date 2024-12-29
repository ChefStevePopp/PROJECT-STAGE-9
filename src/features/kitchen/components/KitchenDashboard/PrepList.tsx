import React from 'react';

interface PrepItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  assignedTo?: string;
}

interface PrepListProps {
  items?: PrepItem[];
}

export const PrepList: React.FC<PrepListProps> = ({ items = [] }) => {
  return (
    <div className="card p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Today's Prep List</h2>
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div>
                <h3 className="text-white font-medium">{item.name}</h3>
                <p className="text-sm text-gray-400">
                  {item.quantity} {item.unit}
                </p>
              </div>
              {item.assignedTo && (
                <span className="text-sm text-gray-400">
                  Assigned to: {item.assignedTo}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">
          No prep items scheduled for today
        </div>
      )}
    </div>
  );
};