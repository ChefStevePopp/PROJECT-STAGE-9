import React from 'react';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="p-6 border-b border-gray-800">
      <div className="flex items-center gap-3">
        <img
          src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
          alt="KITCHEN AI"
          className="w-10 h-10 rounded-lg object-cover"
        />
        <div>
          <h1 className="text-xl font-semibold text-white">KITCHEN AI</h1>
          <h2 className="text-xs font-status text-primary-400">ADMIN</h2>
        </div>
      </div>
    </div>
  );
};