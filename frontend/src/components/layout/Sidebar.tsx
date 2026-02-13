"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Compass,
  MessageCircle,
  PlusSquare,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Coins,
} from "lucide-react";
import { auth } from "@/lib/supabase";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";

const NAV_ITEMS = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Explore", icon: Compass, href: "/explore" },
  { label: "Chat", icon: MessageCircle, href: "/chat" },
  { label: "Profile", icon: User, href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth?.user);

  const handleLogout = async () => {
    await auth.signOut();
    dispatch(logout());
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-20 xl:w-64 border-r border-[#27272a] bg-[#0f0f12] text-[#eee] transition-all duration-300 hidden md:flex flex-col font-sans">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Anihush Logo"
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold tracking-tight xl:block hidden group-hover:text-[#ff7e27] transition-colors">
            Anihush
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-[#ff7e27] text-black font-bold shadow-md shadow-orange-900/20"
                  : "text-[#a0a0b0] hover:bg-[#1a1a23] hover:text-white"
              }`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`}
              />
              <span className="hidden xl:block text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto space-y-2 border-t border-[#27272a]">
        {user ? (
          <>
            <div className="px-3 py-2 xl:block hidden">
              <p className="text-xs font-bold text-[#eee] truncate">
                {user.username}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#ff7e27] mt-0.5">
                <Coins className="w-3 h-3" />
                <span className="font-bold">
                  {user.hush_coins?.toLocaleString() || 0} HC
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-3 w-full rounded-lg text-[#a0a0b0] hover:bg-[#ff4757]/10 hover:text-[#ff4757] transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden xl:block text-sm">Logout</span>
            </button>
          </>
        ) : (
          <div className="space-y-1">
            <Link
              href="/login"
              className="flex items-center gap-4 p-3 w-full rounded-lg text-[#a0a0b0] hover:bg-[#1a1a23] hover:text-[#ff7e27] transition-all duration-200"
            >
              <LogIn className="w-5 h-5" />
              <span className="hidden xl:block text-sm">Login</span>
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-4 p-3 w-full rounded-lg text-[#a0a0b0] hover:bg-[#ff7e27]/10 hover:text-[#ff7e27] transition-all duration-200"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden xl:block text-sm">Register</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
