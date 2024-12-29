import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarNavSection } from './SidebarNavSection';
import { getAdminMenuItems } from './menuItems';
import { useDevAccess } from '@/hooks/useDevAccess';

export const ScrollableNav: React.FC = () => {
  const location = useLocation();
  const { isDev } = useDevAccess();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let scrollTimeout: number;
    const handleScroll = () => {
      nav.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        nav.classList.remove('scrolling');
      }, 1000);
    };

    nav.addEventListener('scroll', handleScroll);
    return () => {
      nav.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const menuItems = getAdminMenuItems(isDev);

  return (
    <div 
      ref={navRef}
      className="flex-1 overflow-y-auto overflow-x-hidden py-6 scrollbar-thin"
    >
      <nav className="space-y-8 px-6">
        {menuItems.map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 && <div className="border-t border-gray-800 my-8" />}
            <SidebarNavSection
              {...section}
              currentPath={location.pathname}
              currentHash={location.hash}
            />
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};