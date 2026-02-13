import CompanionList from "@/features/companions/CompanionList";
import StoryRing from "@/features/stories/StoryRing";

export default function CompanionsPage() {
  return (
    <div className="min-h-screen bg-anikama-black">
      {/* Story Ring */}
      <div className="sticky top-0 z-10 bg-anikama-black border-b border-gray-800 py-4">
        <StoryRing />
      </div>

      {/* Companion List */}
      <CompanionList />
    </div>
  );
}
