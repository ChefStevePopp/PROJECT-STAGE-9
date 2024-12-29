import React from 'react';
import { LucideIcon } from 'lucide-react';
import { SidebarNavItem } from './SidebarNavItem';

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface SidebarNavSectionProps {
  id: string;
  label?: string;
  items: NavItem[];
  currentPath: string;
  currentHash: string;
}

export const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({
  id,
  label,
  items,
  currentPath,
  currentHash
}) => {
  return (
    <div>
      {label && (
        <h3 className="text-xs font-status font-medium text-primary-400/80 uppercase tracking-wider mb-3">
          {label}
        </h3>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem
            key={item.path}
            {...item}
            isActive={
              currentPath === item.path ||
              (item.path.includes('#') && currentPath + currentHash === item.path)
            }
          />
        ))}
      </ul>
    </div>
  );
};