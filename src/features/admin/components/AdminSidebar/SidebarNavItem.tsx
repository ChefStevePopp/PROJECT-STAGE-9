import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  isActive: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  icon: Icon,
  label,
  path,
  isActive
}) => {
  return (
    <li>
      <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-gray-800 text-white'
            : 'text-gray-400 hover:text-white hover:bg-gray-800'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
};