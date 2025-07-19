"use client"
import React, {useEffect} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import localFont from 'next/font/local';
import ButtonLink from "../ui/ButtonLink";
import { useUserStore } from "@/app/stores/useUserStores";
import { createClient } from "../../../../utils/supabase/client";

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

export default function Navbar() {

  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser); 

  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user)
    }
    fetchUser()
  }, [])
  
  const handleLogout = async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut({ scope: 'global' }); // ✅ more aggressive logout

    if (error) {
      console.error("Logout error:", error.message);
      return;
    } else {
      console.log("logged out!")
    }

    useUserStore.getState().setUser(null);

    // Let Supabase finish clearing local session
    setTimeout(() => {
      router.push('/signin');
    }, 300);
  };


  return (
    <nav className="w-full h-20 px-6 md:px-10 flex justify-start items-center bg-main shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-b border-black/10">
      {/* Logo */}
      <Link
        href="/"
        className="relative mr-auto"
        style={{ width: "200px", height: "60px" }}
      >
        <Image
          src="/logo-2.png"
          alt="Rehearsely logo"
          fill
          style={{ objectFit: "contain" }}
          sizes="(max-width: 768px) 150px, 200px"
        />
      </Link>

      {
      user ? 
      <button onClick={handleLogout}>
        <ButtonLink text="Logout" className={`font-bold text-lg px-3.5 py-1.5 ${sunsetSerialMediumFont}`} />
      </button> : 
      <Link href={"/signin"} className="ml-auto">
        <ButtonLink 
            text="Login" 
            className="pl-5 pr-6 py-2 text-lg rounded-lg" 
        />
      </Link>
      }

      {/* Profile or user bubble */}
      <div className="w-10 h-10 rounded-full flex justify-center items-center bg-blue-400 text-white text-base font-semibold hover:opacity-90 transition-opacity ml-5">
        M
      </div>
    </nav>
  );
}
