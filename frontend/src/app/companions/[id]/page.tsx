"use client";

import { useParams, useRouter } from "next/navigation";
import ChatWindow from "@/features/chat/ChatWindow";
import AffinityDisplay from "@/features/nakama/AffinityDisplay";
import { ArrowLeft, Sparkles } from "lucide-react";
import Image from "next/image";
import { useCompanion } from "@/queries/companions";

export default function CompanionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companionId = params.id as string;

  const { data: companion, isLoading, error } = useCompanion(companionId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anikama-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-anikama-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading companion...</p>
        </div>
      </div>
    );
  }

  if (error || !companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-anikama-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">Companion not found</p>
          <button
            onClick={() => router.push("/companions")}
            className="px-6 py-3 bg-anikama-orange hover:bg-anikama-orange-light text-black font-bold rounded-lg transition-all"
          >
            Back to Companions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anikama-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-anikama-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/companions")}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Image
              src={companion.avatar_url}
              alt={companion.name}
              width={40}
              height={40}
              className="rounded-full border-2 border-anikama-orange"
            />
            <div>
              <h1 className="text-xl font-bold text-white">{companion.name}</h1>
              <p className="text-sm text-gray-400">{companion.anime_source}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            {/* Avatar */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src={companion.avatar_url}
                alt={companion.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Info Card */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">
                {companion.name}
              </h2>
              <p className="text-gray-400 mb-4">{companion.anime_source}</p>

              <div className="inline-block px-3 py-1 bg-anikama-orange/10 border border-anikama-orange/30 rounded-full text-sm font-semibold text-anikama-orange mb-4">
                {companion.archetype}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  Personality
                </h3>
                <div className="flex flex-wrap gap-2">
                  {companion.personality_traits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-800 rounded-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-anikama-orange" />
                <span className="text-sm text-gray-300">
                  Powered by Gemini AI
                </span>
              </div>
            </div>

            {/* Affinity Display */}
            {companion.affinity && (
              <AffinityDisplay
                affinity={companion.affinity}
                companionName={companion.name}
              />
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <ChatWindow
              companionId={companion.id}
              companionName={companion.name}
              companionAvatar={companion.avatar_url}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
