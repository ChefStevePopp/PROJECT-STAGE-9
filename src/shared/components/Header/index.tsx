import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserMenu } from "../UserMenu";
import { ROUTES } from "@/config/routes";
import { Clock } from "lucide-react";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
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
          </div>

          {/* Date and Time */}
          <div className="hidden md:flex items-center gap-2 bg-gray-800/30 px-4 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-primary-400" />
            <div className="text-gray-300 text-sm">
              <span className="font-medium">{formattedDate}</span>
              <span className="mx-2 text-gray-500">•</span>
              <span className="text-primary-400">{formattedTime}</span>
            </div>
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
