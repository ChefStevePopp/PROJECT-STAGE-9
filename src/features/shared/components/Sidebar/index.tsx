import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, BookOpen, Clock, Settings } from 'lucide-react';
import { ROUTES } from '@/config/routes';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: ChefHat, label: 'Dashboard', path: ROUTES.KITCHEN.DASHBOARD },
    { icon: BookOpen, label: 'Recipes', path: ROUTES.KITCHEN.RECIPES },
    { icon: Clock, label: 'Production', path: ROUTES.KITCHEN.PRODUCTION },
    { icon: Settings, label: 'Admin', path: ROUTES.ADMIN.EXCEL_IMPORTS }
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-20 bg-gray-900 flex flex-col items-center py-8">
      <nav className="flex-1 mt-8">
        <ul className="space-y-6">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group relative
                  ${location.pathname === item.path || (item.label === 'Admin' && location.pathname.startsWith('/admin'))
                    ? 'text-white bg-gray-800'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
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