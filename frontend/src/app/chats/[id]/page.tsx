"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ChatWindow from "@/features/chat/ChatWindow";
import { useCompanion } from "@/queries/companions";

export default function DirectChatPage() {
  const params = useParams();
  const router = useRouter();
  const companionId = params.id as string;

  const { data: companion, isLoading, error } = useCompanion(companionId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f12] text-white">
        Loading chat...
      </div>
    );
  }

  if (error || !companion) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0f0f12] text-white gap-4">
        <p>Companion not found.</p>
        <button
          onClick={() => router.push("/chat")}
          className="px-4 py-2 bg-[#ff7e27] text-black rounded-lg hover:bg-[#ff9a50]"
        >
          Go to Chats
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0c] flex flex-col">
      <ChatWindow
        companionId={companionId}
        companionName={companion.name}
        companionAvatar={companion.avatar_url}
        onBack={() => router.push("/chat")}
      />
    </div>
  );
}
