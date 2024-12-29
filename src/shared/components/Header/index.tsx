import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/shared/components/UserMenu';

interface HeaderProps {
  notifications?: number;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ notifications = 0, className = '' }) => {
  const { user } = useAuth();
  
  // Get organization name from user metadata
  const organizationName = user?.user_metadata?.organization_name || 'Memphis Fire Barbeque Company Inc.';

  return (
    <header className={`bg-gray-900/95 backdrop-blur-sm ${className}`}>
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Branding */}
          <div className="flex items-center gap-4">
            <img
              src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
              alt="KITCHEN AI"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">KITCHEN AI</h1>
              <div className="flex flex-col">
                <p className="text-xs text-gray-400">Turning Your Passion into Profit for</p>
                <p className="text-sm font-medium text-gray-300 font-mono">
                  {organizationName}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-6 h-6" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};