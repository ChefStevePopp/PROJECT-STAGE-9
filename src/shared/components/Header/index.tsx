import React from "react";
import { useNavigate } from "react-router-dom";
import { UserMenu } from "../UserMenu";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Organization */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(ROUTES.KITCHEN.DASHBOARD)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                alt="KITCHEN AI"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-semibold text-white">
                KITCHEN AI
              </span>
            </button>

            {/* Organization Info - for debugging */}
            {organization && (
              <div className="hidden md:block px-3 py-1 rounded-lg bg-gray-800/50 border border-gray-700/50">
                <div className="text-xs font-medium text-gray-400">
                  Organization: {organization.name}
                </div>
                <div className="text-[10px] text-gray-500">
                  ID: {organization.id}
                </div>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
