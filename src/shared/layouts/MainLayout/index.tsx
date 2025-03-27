import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Header } from "@/shared/components/Header";
import { Sidebar } from "@/shared/components/Sidebar";
import { MobileNav } from "@/shared/components/MobileNav";
import { TeamChat } from "@/shared/components/TeamChat";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const MainLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  return (
    <div className="relative h-screen overflow-hidden">
      <Header className="sticky top-0 z-40 border-b border-gray-800" />
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        {" "}
        {/* Adjusted height for the new header */}
        {/* Desktop Sidebar - hidden on mobile */}
        {!isMobile && (
          <Sidebar className="fixed left-0 top-[64px] bottom-0 w-20 z-30 border-r border-gray-800" />
        )}
        {/* Main Content Area - adjusted margins for mobile */}
        <main
          className={`${isMobile ? "ml-0" : "ml-20"} ${isMobile ? "mb-16" : "mr-[2.15rem]"} h-full overflow-y-auto`}
        >
          <div className="mx-auto p-4 max-w-full">
            <Outlet />
          </div>
        </main>
        {/* Gradient Blur Backdrop */}
        <div
          className={`
            fixed inset-0 z-40
            transition-all duration-300 ease-in-out
            pointer-events-none
            bg-gradient-to-l from-gray-900/90 via-gray-900/50 to-transparent
            backdrop-blur-md
            ${isChatOpen ? "opacity-100" : "opacity-0"}
          `}
        />
        {/* Desktop Chat Button - hidden on mobile */}
        {!isMobile && (
          <button
            className="flex items-center justify-center fixed left-0 bottom-4 z-30 w-20 h-12 bg-gray-800/50 hover:bg-primary-600/20 text-gray-400 hover:text-primary-500 transition-all duration-200 border-t border-gray-700/50"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
        {/* Desktop TeamChat */}
        <div
          className={`
            hidden lg:block fixed right-[-625px] top-[64px] bottom-[3rem]
            w-[625px] z-50 transform transition-all duration-300 ease-in-out
            ${isChatOpen ? "translate-x-[-630px]" : "translate-x-0"}
          `}
        >
          <TeamChat
            className="h-full w-full"
            onClose={() => setIsChatOpen(false)}
          />
        </div>
        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileNav onChatClick={() => setIsChatOpen(!isChatOpen)} />
        )}
        {/* Mobile TeamChat */}
        <div
          className={`
            lg:hidden fixed inset-0 z-50 
            transform transition-all duration-300 ease-in-out
            ${isChatOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <TeamChat
            className="h-full w-full"
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};
