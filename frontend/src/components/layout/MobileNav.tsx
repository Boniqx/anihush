"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Explore", icon: Compass, href: "/explore" },
  { label: "Chat", icon: MessageCircle, href: "/chat" },
  { label: "Profile", icon: User, href: "/profile" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f12]/80 backdrop-blur-lg border-t border-white/10 md:hidden pb-safe">
      <div className="flex items-center justify-around p-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive ? "text-[#ff7e27]" : "text-[#a0a0b0] hover:text-white"
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${isActive ? "fill-current" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
