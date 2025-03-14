import React, { useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminSidebar } from "../AdminSidebar";
import { UserMenu } from "@/shared/components/UserMenu";
import { ROUTES } from "@/config/routes";

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex">
        <div
          className={`${isCollapsed ? "w-20" : "w-64"} transition-all duration-300 flex-shrink-0`}
        >
          <AdminSidebar
            onToggleCollapse={(collapsed) => setIsCollapsed(collapsed)}
          />
        </div>
        <div className="flex-1 min-h-screen overflow-x-auto">
          <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-3">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(ROUTES.KITCHEN.DASHBOARD)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Return to Main Dashboard
              </button>
              <UserMenu />
            </div>
          </div>
          <div className="p-4 md:p-6 lg:p-8 w-full overflow-x-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
