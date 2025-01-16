import React, { useState } from "react";
import { Outlet } from "react-router-dom";
<<<<<<< HEAD
import { Sidebar } from "@/shared/components/Sidebar";
import { Header } from "@/shared/components/Header";
import { TeamChat } from "@/shared/components/TeamChat";
import { MessageCircle } from "lucide-react";
=======
import { MessageCircle } from "lucide-react";
import { Header } from "@/shared/components/Header";
import { Sidebar } from "@/shared/components/Sidebar";
import { TeamChat } from "@/shared/components/TeamChat";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa

export const MainLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header className="sticky top-0 z-40 border-b border-gray-800" />
      <div className="min-h-[calc(100vh-73px)]">
        <Sidebar className="fixed left-0 top-[73px] bottom-0 w-20 z-30 border-r border-gray-800" />

        {/* Desktop Chat Button */}
        <button
          className="hidden lg:flex items-center justify-center fixed left-0 bottom-4 z-30 w-20 h-12 bg-gray-800/50 hover:bg-primary-600/20 text-gray-400 hover:text-primary-500 transition-all duration-200 border-t border-gray-700/50"
          onClick={() => setShouldShowChat(!shouldShowChat)}
=======
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
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
        >
          <MessageCircle className="w-6 h-6" />
        </button>

<<<<<<< HEAD
        {/* Main Content Area */}
        <main className="ml-20 lg:mr-80">
          <div className="max-w-[1200px] mx-auto p-4">
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
            ${shouldShowChat || isTeamChatOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* Desktop TeamChat */}
        <div
          className={`
          hidden lg:block fixed right-[5%] top-[123px] bottom-[3rem]
          w-[625px] z-50 transform transition-all duration-300 ease-in-out
          ${shouldShowChat ? "translate-x-0" : "translate-x-full"}
        `}
        >
          <TeamChat className="h-full w-full" />
        </div>

        {/* Mobile TeamChat */}
        <div
          className={`
          lg:hidden fixed right-[5%] top-[123px] bottom-[3rem]
          w-[625px] z-50 transform transition-all duration-300 ease-in-out
          ${isTeamChatOpen ? "translate-x-0" : "translate-x-full"}
        `}
        >
          <TeamChat className="h-full w-full" />
        </div>

        {/* Mobile Toggle Button */}
=======
        {/* Mobile Chat Button */}
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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
