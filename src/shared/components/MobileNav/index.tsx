import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChefHat,
  Package,
  BookOpen,
  Clock,
  Settings,
  MessageCircle,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

interface MobileNavProps {
  onChatClick: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onChatClick }) => {
  const location = useLocation();
  const { user } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState({
    left: false,
    right: false,
  });

  // All authenticated users can access admin area (for My Account)
  const menuItems = [
    { icon: ChefHat, label: "Dashboard", path: ROUTES.KITCHEN.DASHBOARD },
    { icon: Package, label: "Inventory", path: ROUTES.KITCHEN.INVENTORY },
    { icon: BookOpen, label: "Recipes", path: ROUTES.KITCHEN.RECIPES },
    { icon: Clock, label: "Production", path: ROUTES.KITCHEN.PRODUCTION },
    { icon: Settings, label: "Admin", path: ROUTES.ADMIN.MY_ACCOUNT },
  ];

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    // For admin routes, check if we're anywhere in the admin section
    if (path.startsWith("/admin")) {
      return location.pathname.startsWith("/admin");
    }
    // For other routes, exact match
    return location.pathname === path;
  };

  // Check scroll position to show/hide indicators
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowScrollIndicators({
      left: scrollLeft > 0,
      right: scrollLeft < scrollWidth - clientWidth - 10, // 10px buffer
    });
  };

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      // Initial check
      checkScrollPosition();

      // Check on resize too
      window.addEventListener("resize", checkScrollPosition);

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-40 pb-safe">
      {/* Scroll indicators */}
      {showScrollIndicators.left && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
      {showScrollIndicators.right && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />
      )}
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-thin items-stretch justify-between px-5 py-3"
      >
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center min-w-[4rem] px-4 py-2 rounded-lg transition-all
              ${
                isPathActive(item.path)
                  ? "text-white bg-gray-800"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Chat button */}
        <button
          onClick={onChatClick}
          className="flex flex-col items-center justify-center min-w-[4rem] px-4 py-2 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <MessageCircle className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Chat</span>
        </button>
      </div>
    </div>
  );
};
