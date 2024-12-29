import React, { useState } from 'react';
import { Send } from 'lucide-react';
import type { Message, TeamMember } from '@/shared/types';

interface TeamChatProps {
  className?: string;
  messages?: Message[];
  members?: TeamMember[];
  onSendMessage?: (content: string) => void;
}

export const TeamChat: React.FC<TeamChatProps> = ({ 
  className = '',
  messages = [], 
  members = [], 
  onSendMessage 
}) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className={`flex flex-col bg-gray-800 border-l border-gray-700 rounded-xl shadow-2xl animate-slide-in-right ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm rounded-t-xl">
        <h2 className="text-lg font-semibold text-white">Team Chat</h2>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => {
          const sender = members.find(m => m.id === message.userId);
          return (
            <div key={message.id} className="flex items-start gap-3 mb-4">
              <img
                src={sender?.avatar}
                alt={sender?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{sender?.name}</span>
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
                <p className="text-gray-300 mt-1">{message.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm rounded-b-xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};