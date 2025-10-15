"use client";
import { useEffect, useRef } from "react";
import { useUserStore } from "@/app/stores/useUserStores";
import { createClient } from "../../../../utils/supabase/client";

export default function InitUser() {
  const setUser = useUserStore((s) => s.setUser);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only fetch user once on mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
    };

    fetchUser();
  }, [setUser]);

  return null;
}