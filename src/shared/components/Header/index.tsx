import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserMenu } from "../UserMenu";
import { ROUTES } from "@/config/routes";
import { Clock, Bell, Menu, X, ListFilter } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePrepListTemplateStore } from "@/stores/prepListTemplateStore";

export const Header: React.FC<{
  className?: string;
  onPrepListsSelected?: (selectedPrepLists: string[]) => void;
  isProductionDayView?: boolean;
}> = ({ className = "", onPrepListsSelected, isProductionDayView = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPrepListFilter, setShowPrepListFilter] = useState(false);
  const [selectedPrepLists, setSelectedPrepLists] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery("(max-width: 1000px)");
  const { templates, fetchTemplates } = usePrepListTemplateStore();
  const isProductionRoute = location.pathname.includes(
    ROUTES.KITCHEN.PRODUCTION,
  );

  // Load Adobe Fonts (Typekit) for ChefLife branding
  useEffect(() => {
    if (!document.getElementById("typekit-fonts")) {
      const link = document.createElement("link");
      link.id = "typekit-fonts";
      link.rel = "stylesheet";
      link.href = "https://use.typekit.net/lij2klc.css";
      document.head.appendChild(link);
    }
  }, []);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch templates when on production route
  useEffect(() => {
    if (isProductionRoute) {
      fetchTemplates();
    }
  }, [isProductionRoute, fetchTemplates]);

  // Notify parent component when selected prep lists change
  useEffect(() => {
    if (onPrepListsSelected && isProductionRoute) {
      onPrepListsSelected(selectedPrepLists);
    }
  }, [selectedPrepLists, onPrepListsSelected, isProductionRoute]);

  // Simulate receiving notifications
  useEffect(() => {
    // First notification after 1 minute
    const firstTimer = setTimeout(() => {
      setNotificationCount((prev) => prev + 1);
    }, 60000);

    // Subsequent notifications every 10 minutes
    const recurringTimer = setInterval(() => {
      setNotificationCount((prev) => prev + 1);
    }, 600000); // 10 minutes

    return () => {
      clearTimeout(firstTimer);
      clearInterval(recurringTimer);
    };
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

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

  // Navigation items for mobile menu
  const navItems = [
    { label: "Dashboard", path: ROUTES.KITCHEN.DASHBOARD },
    { label: "Inventory", path: ROUTES.KITCHEN.INVENTORY },
    { label: "Recipes", path: ROUTES.KITCHEN.RECIPES },
    { label: "Production", path: ROUTES.KITCHEN.PRODUCTION },
    { label: "Admin", path: ROUTES.ADMIN.DASHBOARD },
    { label: "My Account", path: ROUTES.ADMIN.MY_ACCOUNT },
    { label: "Settings", path: ROUTES.ADMIN.SETTINGS },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 ${className}`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
          <div className="flex items-center justify-between h-20 w-full w-[1920]">
            {/* ChefLife Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate(ROUTES.KITCHEN.DASHBOARD)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                  alt="ChefLife"
                  className="w-8 h-8"
                />
                <div className="flex flex-col">
                  <span className="flex items-baseline">
                    <span
                      style={{
                        fontFamily: "rockwell, serif",
                        fontWeight: 700,
                        color: "white",
                      }}
                      className="text-lg"
                    >
                      CHEF
                    </span>
                    <span
                      style={{
                        fontFamily: "satisfy, cursive",
                        fontWeight: 400,
                        color: "#3b82f6",
                      }}
                      className="text-lg ml-0.5"
                    >
                      Life
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 -mt-1">
                    Behind Every Great Restaurant
                  </span>
                </div>
              </button>
            </div>

            {/* Date and Time - Only on desktop */}
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
              {/* Notification Bell */}
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </div>
                )}
              </button>

              {/* Desktop User Menu */}
              {!isMobile && <UserMenu />}

              {/* Mobile Menu Button */}
              {isMobile && (
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/95 z-50 mobile-menu-overlay">
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <img
                  src="https://www.restaurantconsultants.ca/wp-content/uploads/2023/03/cropped-AI-CHEF-BOT.png"
                  alt="ChefLife"
                  className="w-8 h-8"
                />
                <div className="flex flex-col">
                  <span className="flex items-baseline">
                    <span
                      style={{
                        fontFamily: "rockwell, serif",
                        fontWeight: 700,
                        color: "white",
                      }}
                      className="text-lg"
                    >
                      CHEF
                    </span>
                    <span
                      style={{
                        fontFamily: "satisfy, cursive",
                        fontWeight: 400,
                        color: "#3b82f6",
                      }}
                      className="text-lg ml-0.5"
                    >
                      Life
                    </span>
                  </span>
                  <span className="text-xs text-gray-400 -mt-1">
                    Behind Every Great Restaurant
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-base font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* User Menu Section */}
            <div className="p-4 border-t border-gray-800">
              <UserMenu isMobile={true} onClose={() => setIsMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
