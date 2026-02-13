"use client";

import React from "react";
import { useSelector } from "react-redux";
import { useCompanions } from "@/queries/companions";
import Link from "next/link";
import {
  Coins,
  Heart,
  MessageCircle,
  Sparkles,
  User,
  ArrowLeft,
} from "lucide-react";
import AffinityBar from "@/features/relationships/AffinityBar";

export default function ProfilePage() {
  const user = useSelector((state: any) => state.auth?.user);
  const isAuthenticated = useSelector(
    (state: any) => state.auth?.isAuthenticated,
  );
  const { data: companions, isLoading } = useCompanions();

  // Filter companions with existing relationships (affinity > 0)
  const activeRelationships =
    companions?.filter(
      (c) => c.relationship && c.relationship.affinity_score > 0,
    ) || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f12] text-[#eee] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <User className="w-16 h-16 text-[#ff7e27] mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-[#a0a0b0] mb-6">
            Please log in to view your profile and relationships.
          </p>
          <Link
            href="/login"
            className="px-6 py-2.5 bg-[#ff7e27] text-black font-bold rounded-xl hover:bg-[#ff9a50] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] text-[#eee] font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f12]/80 backdrop-blur-md border-b border-[#27272a]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-[#27272a] rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#a0a0b0]" />
          </Link>
          <h1 className="font-bold text-lg">My Profile</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* User Info & Balance */}
        <div className="bg-[#1a1a23] rounded-3xl p-6 border border-[#27272a] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff7e27] to-[#ffb700]" />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff7e27] to-[#ffb700] p-[3px]">
              <div className="w-full h-full rounded-full bg-[#1a1a23] flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                  alt={user?.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Name & Balance */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black text-white mb-2">
                {user?.username}
              </h2>

              <div className="inline-flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-[#ff7e27]/20">
                <div className="w-8 h-8 rounded-full bg-[#ff7e27]/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-[#ff7e27]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-[#a0a0b0] uppercase font-bold tracking-wider">
                    Hush Balance
                  </p>
                  <p className="text-lg font-black text-white leading-none">
                    {user?.hush_coins?.toLocaleString() || 0}{" "}
                    <span className="text-[#ff7e27] text-xs">HC</span>
                  </p>
                </div>
                {/* Top Up Button (using link to home properly later or modal trigger if accessible provided context) */}
                {/* For now just valid display */}
              </div>
            </div>
          </div>
        </div>

        {/* Affinities Section */}
        <div>
          <h3 className="flex items-center gap-2 text-xl font-bold mb-6">
            <Heart className="w-5 h-5 text-[#ff4757] fill-[#ff4757]" />
            Relationships
          </h3>

          {isLoading ? (
            <div className="text-center py-10 text-[#a0a0b0]">
              Loading relationships...
            </div>
          ) : activeRelationships.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeRelationships.map((companion) => (
                <div
                  key={companion.id}
                  className="bg-[#1a1a23] rounded-2xl p-4 border border-[#27272a] flex items-center gap-4 hover:border-[#ff7e27]/30 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#27272a]">
                    <img
                      src={companion.avatar_url}
                      alt={companion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-white truncate">
                        {companion.name}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27272a] text-[#a0a0b0] border border-[#3f3f46]">
                        Lvl{" "}
                        {Math.floor(
                          (companion.relationship?.affinity_score || 0) / 100,
                        ) + 1}
                      </span>
                    </div>

                    <div className="mb-2">
                      <AffinityBar
                        score={companion.relationship?.affinity_score || 0}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#777]">
                      <span>{companion.relationship?.current_mood}</span>
                      <Link
                        href={`/chat/${companion.id}`}
                        className="flex items-center gap-1 text-[#ff7e27] hover:underline"
                      >
                        <MessageCircle className="w-3 h-3" /> Chat
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#1a1a23] rounded-3xl p-8 border border-[#27272a] border-dashed text-center">
              <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#555]" />
              </div>
              <h4 className="font-bold text-lg mb-2">No Relationships Yet</h4>
              <p className="text-[#a0a0b0] text-sm mb-6 max-w-xs mx-auto">
                Start chatting with companions to build affinity and unlock
                their stories.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#ff7e27] text-black font-bold rounded-xl hover:bg-[#ff9a50] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Interact with a Companion Now
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
