"use client";

import { useEffect, useState } from "react";
import { UserAffinity } from "@/types";

interface AffinityDisplayProps {
  affinity: UserAffinity;
  companionName: string;
}

export default function AffinityDisplay({
  affinity,
  companionName,
}: AffinityDisplayProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const xpInCurrentLevel = affinity.xp % 100;
  const xpForNextLevel = 100;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Nakama Level</h3>
        <div className="px-4 py-2 bg-gradient-to-r from-anikama-orange to-anikama-orange-light rounded-full">
          <span className="text-2xl font-bold text-black">
            {affinity.level}
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Experience</span>
          <span className="text-white font-semibold">
            {xpInCurrentLevel} / {xpForNextLevel} XP
          </span>
        </div>

        <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-anikama-orange to-anikama-orange-light transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>

        <p className="text-xs text-gray-500 text-right">
          {100 - xpInCurrentLevel} XP to level {affinity.level + 1}
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Total XP</p>
          <p className="text-lg font-bold text-anikama-orange">{affinity.xp}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">Last Chat</p>
          <p className="text-sm font-semibold text-white">
            {new Date(affinity.last_interaction).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-anikama-orange/10 border border-anikama-orange/30 rounded-lg">
        <p className="text-xs text-gray-300">
          💬 <strong>+1 XP</strong> per message sent
          <br />
          📖 <strong>+5 XP</strong> per story viewed
        </p>
      </div>
    </div>
  );
}
