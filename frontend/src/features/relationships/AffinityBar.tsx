import React from "react";

interface AffinityBarProps {
  score: number; // -100 to 100
}

export default function AffinityBar({ score }: AffinityBarProps) {
  // Determine Level and Color
  let level = 1;
  let colorClass = "bg-gray-500";
  let label = "Acquaintance";

  if (score > 80) {
    level = 4;
    colorClass = "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.7)]";
    label = "Partner";
  } else if (score > 50) {
    level = 3;
    colorClass = "bg-red-500";
    label = "Close Friend";
  } else if (score > 20) {
    level = 2;
    colorClass = "bg-orange-500";
    label = "Friend";
  }

  // Calculate percentage for width (map -100..100 to 0..100 for simplicity, or 0..100 if score is always positive? Spec says -100 to 100)
  // Let's assume visualization is 0 to 100% filling the bar.
  // We can map -100 -> 0%, 100 -> 100%.
  // Percentage = (score + 100) / 2
  const percentage = Math.max(0, Math.min(100, (score + 100) / 2));

  return (
    <div className="w-full mt-1">
      <div className="flex justify-between items-center text-[10px] text-gray-400 mb-0.5">
        <span>{label}</span>
        <span>Lvl {level}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
