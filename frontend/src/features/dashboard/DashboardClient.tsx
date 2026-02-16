"use client";

import React, { useRef, useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Clock,
  Coins,
} from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRelationship } from "@/queries/relationships";
import { useSelector } from "react-redux";
import Link from "next/link";
import type { Companion } from "@/types";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import AffinityBar from "@/features/relationships/AffinityBar";
import HushBankModal from "@/features/economy/HushBankModal";

// --- Mock Data ---
const TRENDING_TOPICS = [
  { id: 1, name: "Late Night Talks", count: "2.4k" },
  { id: 2, name: "Battle Strategies", count: "1.8k" },
  { id: 3, name: "Cooking with Yor", count: "950" },
];

const RECENT_ACTIVITY = [
  { id: 1, user: "Gojo", action: "went live.", time: "2m" },
  { id: 2, user: "Zero Two", action: "posted a memory.", time: "15m" },
  { id: 3, user: "Frieren", action: "is meditating.", time: "1h" },
];

// --- Helper: extract unique tags from companion data ---
function extractTags(companions: Companion[] | undefined): string[] {
  if (!companions) return [];
  const tagSet = new Set<string>();
  companions.forEach((c) => c.tags?.forEach((t) => tagSet.add(t)));
  // Limit to top 5 tags for cleaner UI
  const sorted = Array.from(tagSet).sort().slice(0, 5);
  return ["All", ...sorted];
}

interface DashboardClientProps {
  initialCompanions: Companion[];
}

export default function DashboardClient({
  initialCompanions,
}: DashboardClientProps) {
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBankOpen, setIsBankOpen] = useState(false);
  const { setShowAuthFlow } = useDynamicContext();

  // Auth state from Redux
  const user = useSelector((state: any) => state.auth?.user);
  const isAuthenticated = useSelector(
    (state: any) => state.auth?.isAuthenticated,
  );

  // Use initial data directly, avoiding isLoading state on mount
  // Deduplicate companions by name
  const companions = useMemo(() => {
    if (!initialCompanions) return [];
    const unique = new Map();
    initialCompanions.forEach((c) => {
      if (!unique.has(c.name)) {
        unique.set(c.name, c);
      }
    });
    return Array.from(unique.values());
  }, [initialCompanions]);

  // Tags derived from unique companion data
  const tags = useMemo(() => extractTags(companions), [companions]);

  // Filtering: by tag + search
  const filteredCompanions = useMemo(() => {
    if (!companions) return [];
    let result = companions;

    // Tag filter
    if (activeTag !== "All") {
      result = result.filter((c) => c.tags?.includes(activeTag));
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.archetype.toLowerCase().includes(q) ||
          c.anime_source.toLowerCase().includes(q),
      );
    }

    return result;
  }, [companions, activeTag, searchQuery]);

  // Helper to find avatar for activity feed
  const getActivityAvatar = (userName: string) => {
    // Find a companion whose name includes the user name (e.g., "Gojo Satoru" includes "Gojo")
    const companion = companions.find((c) =>
      c.name.toLowerCase().includes(userName.toLowerCase()),
    );

    // Return real avatar or dicebear fallback
    if (companion?.avatar_url) {
      return companion.avatar_url;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;
  };

  // Refs for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Staggered Entry Animation
  useGSAP(
    () => {
      // Clean previous refs just in case context changed
      // storyRefs.current = storyRefs.current.slice(0, companions.length);

      // Only animate if we haven't already shown content (or maybe always animate on mount?)
      // Let's keep it simple and animate on mount like before.

      gsap.fromTo(
        storyRefs.current.filter(Boolean),
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: "back.out(1.5)",
        },
      );

      gsap.fromTo(
        cardRefs.current.filter(Boolean),
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.15,
        },
      );
    },
    { scope: containerRef, dependencies: [] }, // Empty deps ensures run once on mount
  );

  return (
    <div
      ref={containerRef}
      className="h-screen bg-[#0f0f12] text-[#eee] font-sans selection:bg-[#ff7e27] selection:text-black overflow-hidden flex flex-col"
    >
      <div className="flex-1 flex flex-col xl:flex-row gap-6 p-4 max-w-7xl mx-auto w-full h-full min-h-0">
        {/* ═══════════ Main Content ═══════════ */}
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Header Bar */}
          <header className="shrink-0 flex items-center gap-3 bg-[#1a1a23] p-3 rounded-2xl border border-[#27272a]">
            <Search className="w-5 h-5 text-[#555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companions..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder-[#555] text-[#eee]"
            />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <DynamicWidget />
              </div>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setShowAuthFlow(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#ff7e27] text-black rounded-lg hover:bg-[#ff9a50] transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" />{" "}
                  <span className="hidden sm:inline">Sync</span>
                </button>
              </div>
            )}
          </header>

          <HushBankModal
            isOpen={isBankOpen}
            onClose={() => setIsBankOpen(false)}
            currentBalance={user?.hush_coins || 0}
            onSuccess={(newBalance) => {
              window.location.reload();
            }}
          />

          {/* Stories Row */}
          <div className="shrink-0 flex gap-4 overflow-x-auto pb-1 no-scrollbar min-h-[90px]">
            {companions
              ?.filter((c) => c.has_stories)
              .slice(0, 8)
              .map((companion, i) => (
                <Link
                  key={companion.id}
                  href={`/stories/${companion.id}`}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div
                    ref={(el) => {
                      storyRefs.current[i] = el as any;
                    }}
                    className="w-[64px] h-[64px] rounded-full p-[2.5px] bg-gradient-to-br from-[#ff7e27] to-[#ffb700]"
                  >
                    <div className="w-full h-full relative rounded-full bg-[#0f0f12] p-[2px]">
                      <Image
                        src={companion.avatar_url}
                        alt={companion.name}
                        fill
                        sizes="64px"
                        className="object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#a0a0b0] max-w-[64px] truncate text-center">
                    {companion.name.split(" ")[0]}
                  </span>
                </Link>
              ))}
          </div>

          {/* ——— Tag Filter Pills ——— */}
          <div className="shrink-0 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeTag === tag
                    ? "bg-[#ff7e27] text-black shadow-lg shadow-orange-900/20"
                    : "bg-[#1a1a23] text-[#a0a0b0] border border-[#27272a] hover:border-[#ff7e27]/40 hover:text-[#eee]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* ——— Companions Grid ——— */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {filteredCompanions.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <p className="text-[#555] text-sm">
                    No companions found
                    {searchQuery ? ` for "${searchQuery}"` : ""}.
                  </p>
                </div>
              ) : (
                filteredCompanions.map((companion, i) => (
                  <div
                    key={companion.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="h-full"
                  >
                    <CompanionCard companion={companion} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logged-out CTA Banner */}
          {!isAuthenticated && (
            <div className="shrink-0 bg-[#1a1a23] rounded-2xl p-4 border border-[#27272a] text-center flex items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-bold text-sm text-[#eee]">
                  Join Animekama
                </h3>
                <p className="text-xs text-[#a0a0b0]">
                  Unlock premium features & chat with more companions.
                </p>
              </div>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#ff7e27] text-black font-bold text-xs rounded-lg hover:bg-[#ff9a50] transition-colors whitespace-nowrap"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* ═══════════ Right Sidebar ═══════════ */}
        <aside className="hidden xl:flex w-72 flex-col gap-4 overflow-y-auto no-scrollbar shrink-0">
          {/* Hush Wallet */}
          {isAuthenticated && (
            <div className="bg-[#1a1a23] rounded-2xl p-5 border border-[#27272a] text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff7e27] to-[#ffb700]" />

              <div className="w-12 h-12 bg-[#ff7e27]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#ff7e27]/20 group-hover:scale-110 transition-transform duration-300">
                <Coins className="w-6 h-6 text-[#ff7e27]" />
              </div>

              <h3 className="font-bold text-sm text-[#eee] mb-0.5">
                Hush Wallet
              </h3>
              <p className="text-[10px] text-[#a0a0b0] mb-4 uppercase tracking-wider">
                Available Balance
              </p>

              <div className="mb-5">
                <span className="text-3xl font-black text-white tracking-tight">
                  {user?.hush_coins?.toLocaleString() || 0}
                </span>
                <span className="text-xs text-[#ff7e27] font-bold ml-1">
                  HC
                </span>
              </div>

              <button
                onClick={() => setIsBankOpen(true)}
                className="w-full py-2.5 bg-[#ff7e27] text-black text-xs font-bold rounded-xl hover:bg-[#ff9a50] transition-all active:scale-95 shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                Top Up Coins
              </button>
            </div>
          )}

          {/* Trending */}
          <div className="bg-[#1a1a23] rounded-2xl p-5 border border-[#27272a]">
            <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-[#ff7e27]">
              <TrendingUp className="w-4 h-4" /> Trending
            </h3>
            <div className="space-y-3">
              {TRENDING_TOPICS.map((topic, i) => (
                <div
                  key={topic.id}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <span
                    className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded ${
                      i === 0
                        ? "bg-[#ff7e27] text-black"
                        : "bg-[#27272a] text-[#777]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold group-hover:text-[#ff7e27] transition-colors">
                      {topic.name}
                    </p>
                    <p className="text-[10px] text-[#555]">{topic.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-[#1a1a23] rounded-2xl p-5 border border-[#27272a] flex-1">
            <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-[#ffb700]">
              <Clock className="w-4 h-4" /> Activity
            </h3>
            <div className="space-y-4 relative pl-2">
              <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-[#27272a]" />
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex gap-3 relative z-10">
                  <div className="relative w-6 h-6 rounded-full bg-[#27272a] border border-[#1a1a23] overflow-hidden shrink-0">
                    <img
                      src={getActivityAvatar(activity.user)}
                      alt={activity.user}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#aaa]">
                      <span className="text-[#eee] font-bold">
                        {activity.user}
                      </span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-[10px] text-[#555]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logged-out sidebar CTA */}
          {!isAuthenticated && (
            <div className="bg-[#1a1a23] rounded-2xl p-5 border border-[#27272a] text-center">
              <h3 className="font-bold text-sm mb-2">New here?</h3>
              <p className="text-xs text-[#a0a0b0] mb-3">
                Create an account to start chatting
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setShowAuthFlow(true)}
                  className="block w-full py-2 bg-[#ff7e27] text-black text-xs font-bold rounded-lg hover:bg-[#ff9a50] transition-colors"
                >
                  Sync Wallet
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// --- Companion Card (reference-inspired design) ---
function CompanionCard({ companion }: { companion: Companion }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { contextSafe } = useGSAP({ scope: cardRef });

  const onHover = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -6,
      scale: 1.02,
      duration: 0.25,
      ease: "power2.out",
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
    });
  });

  return (
    <Link href={`/chat/${companion.id}`} className="block h-full">
      <div
        ref={cardRef}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className="relative rounded-xl overflow-hidden cursor-pointer group h-full min-h-[300px] bg-[#1a1a23] border border-[#27272a] hover:border-[#ff7e27]/40 transition-colors"
      >
        {/* Full Background Image */}
        <Image
          src={companion.avatar_url}
          alt={companion.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover group-hover:scale-110 transition-all duration-700 ${
            isLoading
              ? "blur-xl scale-110 grayscale"
              : "blur-0 scale-100 grayscale-0"
          }`}
          onLoad={() => setIsLoading(false)}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Top Badge — Mood */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className="text-[9px] font-bold bg-black/60 backdrop-blur-sm text-[#ff7e27] px-2 py-0.5 rounded-full uppercase tracking-wider">
            {companion.mood}
          </span>
        </div>

        {/* Chat Icon on Hover */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-[#ff7e27] rounded-full flex items-center justify-center text-black shadow-lg">
            <MessageCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <h3 className="font-black text-sm text-white uppercase tracking-wide drop-shadow-lg">
            {companion.name}
          </h3>
          <p className="text-[10px] text-white/70 font-medium mt-0.5">
            {companion.anime_source}
          </p>
          {/* Tags */}
          {companion.tags && companion.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {companion.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[8px] font-bold bg-white/15 backdrop-blur-sm text-white/80 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Affinity Bar or Interact CTA */}
          <CompanionRelationship companionId={companion.id} />
        </div>
      </div>
    </Link>
  );
}

function CompanionRelationship({ companionId }: { companionId: string }) {
  const { data: relationship, isLoading } = useRelationship(companionId);

  if (isLoading)
    return <div className="mt-2 h-2 w-full bg-white/5 animate-pulse rounded" />;

  return relationship?.found ? (
    <AffinityBar score={relationship.affinity_score} />
  ) : (
    <div className="mt-2 text-center">
      <span className="text-[10px] font-bold text-[#ff7e27] uppercase tracking-wide border border-[#ff7e27]/30 px-2 py-1 rounded bg-[#ff7e27]/5 hover:bg-[#ff7e27]/10 transition-colors">
        Interact to Start Relationship
      </span>
    </div>
  );
}
