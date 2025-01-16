import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { menuItems } from "./menuItems";

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { isDev } = useAuth();
  console.log("Is Dev User:", isDev); // Debug log
  const items = menuItems(isDev);

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="space-y-8 px-6">
          {items.map((section) => (
            <div key={section.id}>
              {section.label && (
                <h3 className="text-xs font-status font-medium text-primary-400/80 uppercase tracking-wider mb-3">
                  {section.label}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
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
