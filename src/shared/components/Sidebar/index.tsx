import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Package, BookOpen, Clock, Settings } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // All authenticated users can access admin area (for My Account)
  const menuItems = [
    { icon: ChefHat, label: 'Dashboard', path: ROUTES.KITCHEN.DASHBOARD },
    { icon: Package, label: 'Inventory', path: ROUTES.KITCHEN.INVENTORY },
    { icon: BookOpen, label: 'Recipes', path: ROUTES.KITCHEN.RECIPES },
    { icon: Clock, label: 'Production', path: ROUTES.KITCHEN.PRODUCTION },
    { icon: Settings, label: 'Admin', path: ROUTES.ADMIN.MY_ACCOUNT }
  ];

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    // For admin routes, check if we're anywhere in the admin section
    if (path.startsWith('/admin')) {
      return location.pathname.startsWith('/admin');
    }
    // For other routes, exact match
    return location.pathname === path;
  };

  return (
    <div className="fixed inset-y-0 left-0 w-20 bg-gray-900 flex flex-col items-center py-8 z-30">
      <nav className="flex-1 mt-32">
        <ul className="space-y-6">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative
                  ${isPathActive(item.path)
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};