"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading } from "@/store/authSlice";
import { supabase } from "@/lib/supabase";

export default function AuthListener({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check initial session
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            username:
              session.user.user_metadata?.username ||
              session.user.email?.split("@")[0] ||
              "User",
            tier: "free",
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString(),
          }),
        );
      } else {
        dispatch(setLoading(false));
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            username:
              session.user.user_metadata?.username ||
              session.user.email?.split("@")[0] ||
              "User",
            tier: "free",
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || new Date().toISOString(),
          }),
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
