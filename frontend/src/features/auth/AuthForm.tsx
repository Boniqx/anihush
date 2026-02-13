"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/supabase";
import { useDispatch } from "react-redux";
import { setUser, setError } from "@/store/authSlice";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

interface AuthFormProps {
  mode?: "login" | "register";
}

export default function AuthForm({
  mode: initialMode = "login",
}: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        const { data, error } = await auth.signIn(email, password);
        if (error) throw error;

        if (data.user) {
          dispatch(
            setUser({
              id: data.user.id,
              username:
                data.user.user_metadata?.username || email.split("@")[0],
              tier: "free",
              created_at: data.user.created_at || new Date().toISOString(),
              updated_at: data.user.updated_at || new Date().toISOString(),
            }),
          );
          router.push("/");
        }
      } else {
        if (!username.trim()) {
          throw new Error("Username is required");
        }

        const { data, error } = await auth.signUp(email, password, username);
        if (error) throw error;

        if (data.user) {
          // Check if email confirmation is required
          if (data.user.identities?.length === 0) {
            throw new Error(
              "This email is already registered. Try logging in.",
            );
          }

          setSuccessMsg(
            "Account created! Check your email for confirmation, or log in now.",
          );
          dispatch(
            setUser({
              id: data.user.id,
              username,
              tier: "free",
              created_at: data.user.created_at || new Date().toISOString(),
              updated_at: data.user.updated_at || new Date().toISOString(),
            }),
          );
          router.push("/");
        }
      }
    } catch (err: any) {
      const msg = err.message || "Authentication failed";
      setErrorMsg(msg);
      dispatch(setError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f12]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#ff7e27] flex items-center justify-center text-black">
              <span className="font-bold text-xl">A</span>
            </div>
            <h1 className="text-3xl font-bold text-[#eee]">Animekama</h1>
          </div>
          <p className="text-sm text-[#777]">Your Anime AI Companion</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a23] rounded-2xl p-6 border border-[#27272a]">
          {/* Toggle */}
          <div className="flex gap-1 mb-6 bg-[#0f0f12] rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                isLogin
                  ? "bg-[#ff7e27] text-black"
                  : "text-[#777] hover:text-[#aaa]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                !isLogin
                  ? "bg-[#ff7e27] text-black"
                  : "text-[#777] hover:text-[#aaa]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Registration only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-[#aaa] mb-1.5 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-sm text-[#eee] placeholder-[#555] focus:outline-none focus:border-[#ff7e27] transition-colors"
                  placeholder="Choose a username"
                  required={!isLogin}
                  minLength={3}
                  maxLength={20}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#aaa] mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-sm text-[#eee] placeholder-[#555] focus:outline-none focus:border-[#ff7e27] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#aaa] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-sm text-[#eee] placeholder-[#555] focus:outline-none focus:border-[#ff7e27] transition-colors pr-10"
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="p-2.5 bg-[#ff4757]/10 border border-[#ff4757]/30 rounded-lg text-[#ff4757] text-xs">
                {errorMsg}
              </div>
            )}

            {/* Success */}
            {successMsg && (
              <div className="p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-xs">
                {successMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#ff7e27] hover:bg-[#ff9a50] text-black font-bold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-[#555] mt-5">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="text-[#ff7e27] hover:text-[#ff9a50] font-bold"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
