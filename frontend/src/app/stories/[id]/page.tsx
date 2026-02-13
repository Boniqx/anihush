"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useCompanions } from "@/queries/companions";
import { useStories } from "@/queries/stories";
import StoryViewer from "@/features/stories/StoryViewer";
import { StoriesGrouped, Story } from "@/types";
import { Sparkles } from "lucide-react";

export default function StoriesPage() {
  const params = useParams();
  const router = useRouter();
  const companionId = params.id as string;

  // Use the useStories hook to fetch all stories
  const { data: allStoriesGrouped, isLoading, error } = useStories();
  const { data: companions } = useCompanions();

  // Filter for the specific companion's stories
  const storiesGrouped = allStoriesGrouped?.find(
    (group) => group.companion_id === companionId,
  );

  const companion = companions?.find((c) => c.id === companionId);

  const handleClose = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
        <Sparkles className="w-6 h-6 animate-spin mr-2 text-[#ff7e27]" />
        Loading stories...
      </div>
    );
  }

  if (error || !storiesGrouped) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="text-red-500 mb-4">Story not found or failed to load.</p>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-[#ff7e27] text-black rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative">
      <StoryViewer
        stories={storiesGrouped}
        onClose={handleClose}
        initialMood={companion?.relationship?.current_mood || companion?.mood}
      />
    </div>
  );
}
