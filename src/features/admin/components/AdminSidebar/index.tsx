import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { menuItems } from "./menuItems";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminSidebarProps {
  onToggleCollapse?: (collapsed: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { isDev } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const items = menuItems(isDev);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onToggleCollapse) {
      onToggleCollapse(newCollapsedState);
    }
  };

  return (
    <div
      className={`h-screen bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 relative ${isCollapsed ? "w-20" : ""}`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
        >
          <img
            src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
            alt="KITCHEN AI"
            className={`rounded-lg object-contain ${isCollapsed ? "w-10 h-10" : "w-12 h-10"}`}
          />
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-semibold text-white">KITCHEN AI</h1>
              <h2 className="text-xs font-status text-primary-400">ADMIN</h2>
            </div>
          )}
        </div>
      </div>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-20 -right-3 bg-gray-800 rounded-full p-1 border border-gray-700 text-gray-400 hover:text-white z-50 shadow-md"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className={`space-y-8 ${isCollapsed ? "px-2" : "px-6"}`}>
          {items.map((section) => (
            <div key={section.id}>
              {section.label && !isCollapsed && (
                <h3 className="text-xs font-status font-medium text-primary-400/80 uppercase tracking-wider mb-3">
                  {section.label}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-2"} rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                      title={isCollapsed ? item.label : ""}
                    >
                      <item.icon
                        className={
                          isCollapsed
                            ? "w-6 h-6 text-primary-400/30"
                            : "w-5 h-5"
                        }
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};
