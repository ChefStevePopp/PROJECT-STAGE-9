import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Header } from "@/shared/components/Header";
import { Sidebar } from "@/shared/components/Sidebar";
import { TeamChat } from "@/shared/components/TeamChat";

export const MainLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header className="sticky top-0 z-40 border-b border-gray-800" />
      <div className="min-h-[calc(100vh-73px)]">
        <Sidebar className="fixed left-0 top-[73px] bottom-0 w-20 z-30 border-r border-gray-800" />

        {/* Main Content Area */}
        <main className="ml-20 mr-[2.15rem]">
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

        {/* Desktop Chat Button */}
        <button
          className="hidden lg:flex items-center justify-center fixed left-0 bottom-4 z-30 w-20 h-12 bg-gray-800/50 hover:bg-primary-600/20 text-gray-400 hover:text-primary-500 transition-all duration-200 border-t border-gray-700/50"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Desktop TeamChat */}
        <div
          className={`
            hidden lg:block fixed right-[-625px] top-[123px] bottom-[3rem]
            w-[625px] z-50 transform transition-all duration-300 ease-in-out
            ${isChatOpen ? "translate-x-[-630px]" : "translate-x-0"}
          `}
        >
          <TeamChat
            className="h-full w-full"
            onClose={() => setIsChatOpen(false)}
          />
        </div>

        {/* Mobile Chat Button */}
        <button
          className="lg:hidden fixed right-4 bottom-4 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>

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
