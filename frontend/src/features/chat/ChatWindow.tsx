"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { addMessage, setTyping, setMessages } from "@/store/chatSlice";
import { ChatMessage } from "@/types";
import { ArrowLeft, Send } from "lucide-react";
import { textAnimations } from "@/lib/gsap-config";
import { useSendMessage, useGetChatHistory } from "@/queries/chat";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface ChatWindowProps {
  companionId: string;
  companionName: string;
  companionAvatar: string;
  onBack?: () => void;
}

export default function ChatWindow({
  companionId,
  companionName,
  companionAvatar,
  onBack,
}: ChatWindowProps) {
  const dispatch = useDispatch();
  const messages = useSelector(
    (state: RootState) => state.chat.messages[companionId] || [],
  );
  const { isTyping } = useSelector((state: RootState) => state.chat);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useSendMessage();

  const { user, setShowAuthFlow } = useDynamicContext();
  const getChatHistory = useGetChatHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history on mount
  useEffect(() => {
    if (companionId && user) {
      getChatHistory
        .mutateAsync(companionId)
        .then((data) => {
          const mappedMessages: ChatMessage[] = data.messages.map(
            (msg: any) => ({
              id: msg.id,
              content: msg.content,
              sender: msg.role === "assistant" ? "companion" : "user",
              timestamp: new Date(msg.created_at),
              companionId: msg.companion_id,
            }),
          );
          dispatch(setMessages({ companionId, messages: mappedMessages }));
        })
        .catch((err) => console.error("Failed to load history", err));
    }
  }, [companionId, user]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!user) {
      setShowAuthFlow(true);
      return;
    }

    // TODO: Implement actual credit check
    const hasCredits = true;
    if (!hasCredits) {
      // user.showProfile(); // Or trigger specific payment flow
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: input,
      timestamp: new Date(),
      companionId: companionId,
    };

    dispatch(addMessage({ companionId, message: userMessage }));
    setInput("");
    dispatch(setTyping(true));

    try {
      const response = await sendMessageMutation.mutateAsync({
        companion_id: companionId,
        message: input,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "companion",
        content: response.response,
        timestamp: new Date(),
        companionId: companionId,
      };

      dispatch(addMessage({ companionId, message: aiMessage }));
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "companion",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        companionId: companionId,
      };
      dispatch(addMessage({ companionId, message: errorMessage }));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 md:rounded-2xl overflow-hidden border-x md:border border-gray-800">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center gap-3 border-b border-gray-700">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-anikama-orange">
          <img
            src={companionAvatar}
            alt={companionName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-white">{companionName}</h3>
          <p className="text-xs text-gray-400">AI Companion</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation with {companionName}!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.sender === "user"
                  ? "bg-anikama-orange text-black"
                  : "bg-gray-800 text-white"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div ref={typingRef} className="bg-gray-800 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${companionName}...`}
            className="flex-1 bg-gray-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-anikama-orange"
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessageMutation.isPending}
            className="bg-anikama-orange hover:bg-anikama-orange-light disabled:opacity-50 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
