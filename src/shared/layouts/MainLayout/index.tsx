import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Header } from "@/shared/components/Header";
import { Sidebar } from "@/shared/components/Sidebar";
import { TeamChat } from "@/shared/components/TeamChat";

export const MainLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="fixed right-0 bottom-0 z-50">
        {/* Desktop Chat Button */}
        <button
          className="hidden lg:flex items-center justify-center fixed left-0 bottom-4 z-30 w-20 h-12 bg-gray-800/50 hover:bg-primary-600/20 text-gray-400 hover:text-primary-500 transition-all duration-200 border-t border-gray-700/50"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Mobile Chat Button */}
        <button
          className="lg:hidden fixed right-4 bottom-4 w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Chat Panel */}
        {isChatOpen && <TeamChat onClose={() => setIsChatOpen(false)} />}
      </div>
    </div>
  );
};
