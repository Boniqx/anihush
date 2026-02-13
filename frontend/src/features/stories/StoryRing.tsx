"use client";
import { useCompanions } from "@/queries/companions";

// Mock data for stories since backend might not have it yet
const STORY_MOCK = [
  {
    id: "1",
    name: "Zero Two",
    avatar: "https://placehold.co/100x100/FF0000/white?text=02",
    hasStory: true,
  },
  {
    id: "2",
    name: "Power",
    avatar: "https://placehold.co/100x100/FF9900/white?text=P",
    hasStory: true,
  },
  {
    id: "3",
    name: "Makima",
    avatar: "https://placehold.co/100x100/CC0000/white?text=M",
    hasStory: true,
  },
  {
    id: "4",
    name: "Levi",
    avatar: "https://placehold.co/100x100/000000/white?text=L",
    hasStory: true,
  },
  {
    id: "5",
    name: "Gojo",
    avatar: "https://placehold.co/100x100/FFFFFF/black?text=G",
    hasStory: true,
  },
  {
    id: "6",
    name: "Hinata",
    avatar: "https://placehold.co/100x100/8888FF/white?text=H",
    hasStory: true,
  },
  {
    id: "7",
    name: "Nezuko",
    avatar: "https://placehold.co/100x100/FF66CC/white?text=N",
    hasStory: true,
  },
];

export default function StoryRing() {
  const { data: companions } = useCompanions();

  // Use mock data if no companions, or mix them
  const stories =
    companions && companions.length > 0
      ? companions
          .slice(0, 8)
          .map((c) => ({
            id: c.id,
            name: c.name,
            avatar: c.avatar_url,
            hasStory: true,
          }))
      : STORY_MOCK;

  return (
    <div className="flex gap-4 min-w-max px-2">
      {/* Create Story Button */}
      <div className="flex flex-col items-center gap-2 cursor-pointer group">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-900 border-2 border-dashed border-neutral-700 flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
          <span className="text-2xl text-muted-foreground">+</span>
        </div>
        <span className="text-xs text-muted-foreground">You</span>
      </div>

      {/* Stories */}
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex flex-col items-center gap-2 cursor-pointer"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full border-2 border-black overflow-hidden relative">
              <img
                src={story.avatar}
                alt={story.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-xs text-foreground/80 truncate w-16 text-center">
            {story.name.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
