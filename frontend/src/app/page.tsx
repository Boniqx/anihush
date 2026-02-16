import { getCompanions } from "@/lib/api";
import DashboardClient from "@/features/dashboard/DashboardClient";

// Ensure fresh data on every request since we want to see real-time status updates/stories if possible
export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const companions = await getCompanions();
    return <DashboardClient initialCompanions={companions} />;
  } catch (error) {
    console.error("Server fetch error:", error);
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f0f12] text-[#ff4757]">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            Network issues on the server
          </h2>
          <p className="text-sm text-[#eee]/50">Please try again later.</p>
        </div>
      </div>
    );
  }
}
