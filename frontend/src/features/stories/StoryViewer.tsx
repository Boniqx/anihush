"use client";

import { useEffect, useRef, useState } from "react";
import { StoriesGrouped } from "@/types";
import { useInteract } from "@/queries/relationships";
import { storyAnimations } from "@/lib/gsap-config";
import { X, Heart, Flame, Laugh, Lock, Frown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

interface StoryViewerProps {
  stories: StoriesGrouped;
  onClose: () => void;
  initialMood?: string;
}

export default function StoryViewer({
  stories,
  onClose,
  initialMood = "neutral",
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mood, setMood] = useState(initialMood); // neutral, happy, jealous, annoyed, flirty
  const [toastMessage, setToastMessage] = useState("");

  const storyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentStory = stories.stories[currentIndex];
  const isLocked = currentStory.is_locked;
  // specific companion_id might need to be passed or derived.
  // Assuming stories.companion_id exists based on previous file content.
  const companionId = stories.companion_id;

  useEffect(() => {
    if (storyRef.current) {
      storyAnimations.slideIn(storyRef.current);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!isPaused && !isLocked && progressRef.current) {
      const duration = currentStory.duration;
      const animation = storyAnimations.progressBar(
        progressRef.current,
        duration,
      );

      const timer = setTimeout(() => {
        handleNext();
      }, duration * 1000);

      return () => {
        clearTimeout(timer);
        animation.kill();
      };
    }
  }, [currentIndex, isPaused, isLocked]);

  const handleNext = () => {
    if (currentIndex < stories.stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const [reactionVideo, setReactionVideo] = useState<string | null>(null);

  // ... (existing refs)

  // ... (existing helper functions)

  const { mutateAsync: interact } = useInteract();

  // Interaction Handler
  const handleReaction = async (emoji: string) => {
    let action = "reaction_heart";
    if (emoji === "🔥") action = "reaction_fire";
    if (emoji === "😂") action = "reaction_laugh";
    if (emoji === "😡") action = "reaction_angry";

    // Show local feedback immediately
    showFloatingEmoji(emoji);

    try {
      const data = await interact({
        companionId,
        action,
        storyId: currentStory.id,
      });

      if (data) {
        setMood(data.new_mood);
        setToastMessage(data.toast_message);

        // Show reaction video if available
        if (data.reaction_video_url) {
          setIsPaused(true);
          setReactionVideo(data.reaction_video_url);
        }

        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err: any) {
      console.error("Interaction failed", err);
      // Show error toast
      let message = err.message || "Failed to interact";
      if (message === "Not authenticated") {
        message = "Need to login to interact";
      }
      setToastMessage(message);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleReactionVideoEnd = () => {
    setReactionVideo(null);
    setIsPaused(false);
  };

  const showFloatingEmoji = (emoji: string) => {
    const el = document.createElement("div");
    el.innerText = emoji;
    el.style.position = "absolute";
    el.style.left = "50%";
    el.style.bottom = "100px";
    el.style.fontSize = "40px";
    el.style.zIndex = "100";
    el.style.pointerEvents = "none";
    el.style.transform = "translateX(-50%)";
    document.body.appendChild(el);

    const animation = el.animate(
      [
        { transform: "translate(-50%, 0) scale(1)", opacity: 1 },
        { transform: "translate(-50%, -200px) scale(1.5)", opacity: 0 },
      ],
      {
        duration: 1500,
        easing: "ease-out",
      },
    );

    animation.onfinish = () => el.remove();
  };

  // --- Mood Effects ---
  const getMoodFilter = () => {
    switch (mood) {
      case "jealous":
        return "sepia(0.5) hue-rotate(180deg) saturate(1.5)";
      case "annoyed":
        return "grayscale(0.8) contrast(1.2)";
      case "sad":
        return "grayscale(1) brightness(0.8) blur(1px)";
      default:
        return "none";
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-black/80 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 animate-pulse">
          {toastMessage}
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Companion Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <Image
          src={stories.avatar_url}
          alt={stories.companion_name}
          width={40}
          height={40}
          className="rounded-full border-2 border-[#ff7e27]"
        />
        <div>
          <p className="text-white font-semibold shadow-black drop-shadow-md">
            {stories.companion_name}
          </p>
          <p className="text-xs text-gray-200 shadow-black drop-shadow-md">
            {currentIndex + 1} / {stories.stories.length}
          </p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="absolute top-16 left-0 right-0 z-10 flex gap-1 px-4">
        {stories.stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            {index < currentIndex && <div className="w-full h-full bg-white" />}
            {index === currentIndex && !isLocked && (
              <div ref={progressRef} className="h-full bg-white" />
            )}
          </div>
        ))}
      </div>

      {/* Story Content Container */}
      <div
        ref={storyRef}
        className={`relative w-full max-w-md h-full max-h-[85vh] md:rounded-3xl overflow-hidden bg-black md:border border-[#27272a] shadow-2xl ${mood === "annoyed" ? "animate-shake" : ""}`}
        style={{ filter: getMoodFilter(), transition: "filter 0.5s ease" }}
        onClick={handleTogglePause}
      >
        {isLocked ? (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-20">
            <Lock className="w-16 h-16 text-white/50 mb-4" />
            <p className="text-white text-lg font-bold">Premium Content</p>
            <p className="text-white/70 text-sm mt-2">Subscribe to unlock</p>
          </div>
        ) : currentStory.media_type === "image" ? (
          <Image
            src={currentStory.media_url}
            alt="Story"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <video
            src={currentStory.media_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop={isPaused}
          />
        )}

        {/* Navigation Touch Areas */}
        <div className="absolute inset-0 flex z-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="flex-1 cursor-pointer outline-none"
            disabled={currentIndex === 0}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex-1 cursor-pointer outline-none"
          />
        </div>

        {/* Pause Indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-4">
              <div className="flex gap-2">
                <div className="w-2 h-8 bg-white rounded-full" />
                <div className="w-2 h-8 bg-white rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Interaction Bar (Bottom) */}
        <div
          className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-30"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleReaction("❤️")}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
          >
            <Heart className="w-6 h-6 text-white/80 group-hover:text-red-500 group-hover:fill-red-500 transition-colors" />
          </button>
          <button
            onClick={() => handleReaction("🔥")}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 hover:scale-110 transition-all active:scale-95 group"
          >
            <Flame className="w-6 h-6 text-white/80 group-hover:text-orange-500 group-hover:fill-orange-500 transition-colors" />
          </button>
          <button
            onClick={() => handleReaction("😂")}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 hover:scale-110 transition-all active:scale-95 group"
          >
            <Laugh className="w-6 h-6 text-white/80 group-hover:text-yellow-400 group-hover:fill-yellow-400 transition-colors" />
          </button>
          <button
            onClick={() => handleReaction("😡")}
            className="p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-white/20 hover:scale-110 transition-all active:scale-95 group"
          >
            <Frown className="w-6 h-6 text-white/80 group-hover:text-red-700 group-hover:fill-red-700 transition-colors" />
          </button>
        </div>

        {/* Reaction Video Overlay - Mini */}
        {reactionVideo && (
          <div className="absolute top-24 left-4 z-40 bg-black/60 backdrop-blur-md rounded-2xl p-2 border border-white/10 flex items-center gap-3 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff7e27] relative shrink-0">
              <video
                src={reactionVideo}
                className="w-full h-full object-cover"
                autoPlay
                onEnded={handleReactionVideoEnd}
              />
            </div>
            <div className="pr-2">
              <p className="text-white text-xs font-bold leading-tight">
                {stories.companion_name} is {mood}
              </p>
              <p className="text-white/70 text-[10px] leading-tight">
                because of your reaction
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReactionVideoEnd();
              }}
              className="absolute -top-2 -right-2 bg-white text-black rounded-full p-0.5 shadow-sm hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Mood Indicator (Optional debug/visual) */}
        {mood !== "neutral" && (
          <div className="absolute top-4 right-4 z-20 px-2 py-1 bg-black/60 rounded text-[10px] uppercase font-bold text-white/80">
            Mood: {mood}
          </div>
        )}
      </div>
    </div>
  );
}
