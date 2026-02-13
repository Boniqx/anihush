"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

const AUTH_ROUTES = ["/login", "/register"];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  // Auth pages get full-screen layout without sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0f0f12] text-[#eee] font-sans">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 md:ml-20 xl:ml-64 w-full pb-20 md:pb-0">
        <div className="max-w-[1200px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
