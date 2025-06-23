"use client";
import { useEffect } from "react";
import { useUserStore } from "@/app/stores/useUserStores";
import { createClient } from "../../../../utils/supabase/client";

export default function InitUser() {
  const user = useUserStore((s) => s.user)
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user || null);
    };

    fetchUser();
  }, [setUser]);

  return null;
}