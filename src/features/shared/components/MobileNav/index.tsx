import React from 'react';
import { Home, Package, BookOpen, Clock, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

interface MobileNavProps {
  className?: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({ className = '' }) => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: ROUTES.KITCHEN.DASHBOARD },
    { icon: Package, label: 'Inventory', path: ROUTES.KITCHEN.INVENTORY },
    { icon: BookOpen, label: 'Recipes', path: ROUTES.KITCHEN.RECIPES },
    { icon: Clock, label: 'Production', path: ROUTES.KITCHEN.PRODUCTION },
    { icon: Menu, label: 'Admin', path: ROUTES.ADMIN.DASHBOARD },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 lg:hidden z-50 ${className}`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <div
              className={`flex flex-col items-center transition-colors ${
                location.pathname === item.path ? 'text-primary-500' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;