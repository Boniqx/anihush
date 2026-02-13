"use client";

import { MessageSquare, Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ChatWindow from "@/features/chat/ChatWindow";
import { useChats } from "@/queries/chats";
import { ChatListItem } from "@/types";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);

  // Fetch chats
  const { data, isLoading } = useChats();
  const chats = data?.chats || [];

  // Helper to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // If less than 24 hours, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // If less than 7 days, show day name
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-screen">
      {/* Chat List - Hidden on mobile if chat is selected */}
      <div
        className={`w-full md:w-96 border-r border-white/5 bg-[#0f0f12] flex flex-col ${
          selectedChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0f0f12]/80 backdrop-blur-md z-10">
          <h1 className="text-xl font-bold text-white">Messages</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-[#1a1a23] border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#ff7e27]/50 transition-colors"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
              <p className="text-gray-400 mb-4 text-sm">
                You don't have any companion chats yet.
              </p>
              <Link
                href="/"
                className="px-4 py-2 bg-[#ff7e27] text-black font-bold rounded-lg text-sm hover:bg-[#ff9a50] transition-colors"
              >
                Chat Now
              </Link>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`group flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${
                  selectedChat?.id === chat.id ? "bg-white/5" : ""
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                    <img
                      src={chat.avatar_url}
                      alt={chat.companion_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-white truncate text-sm">
                      {chat.companion_name}
                    </h3>
                    <span className="text-[10px] text-gray-500">
                      {formatTime(chat.last_message_at)}
                    </span>
                  </div>
                  <p className="text-xs truncate text-gray-500">
                    {chat.last_message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area - Visible on mobile if chat is selected */}
      <div
        className={`flex-1 bg-[#0a0a0c] relative overflow-hidden ${
          selectedChat ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedChat ? (
          <div className="w-full h-full">
            <ChatWindow
              companionId={selectedChat.companion_id}
              companionName={selectedChat.companion_name}
              companionAvatar={selectedChat.avatar_url}
              onBack={() => setSelectedChat(null)}
            />
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7e27]/5 to-transparent pointer-events-none" />
            <div className="text-center p-8 max-w-sm relative z-10">
              <div className="w-20 h-20 bg-[#1a1a23] rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12 shadow-lg shadow-[#ff7e27]/10">
                <MessageSquare className="w-10 h-10 text-[#ff7e27]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Select a Conversation
              </h2>
              <p className="text-gray-500 text-sm">
                Choose a companion from the list to start chatting or explore
                new characters to connect with.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
