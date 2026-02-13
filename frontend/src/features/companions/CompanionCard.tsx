"use client";

import Image from "next/image";
import Link from "next/link";
import { Companion } from "@/types";

interface CompanionCardProps {
  companion: Companion;
  index?: number;
}

export default function CompanionCard({ companion }: CompanionCardProps) {
  return (
    <Link href={`/companions/${companion.id}`} className="block">
      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900 border border-border/50">
        {/* Image */}
        <Image
          src={companion.avatar_url || "/placeholder-avatar.png"}
          alt={companion.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />

        {/* Subtle Gradient Overlay for Text Readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-3">
          <h3 className="font-bold text-white text-sm md:text-base leading-tight">
            {companion.name}
          </h3>
          {companion.anime_source && (
            <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5">
              {companion.anime_source}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
