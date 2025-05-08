import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full h-20 px-6 md:px-10 flex justify-between items-center bg-main shadow-[0_2px_6px_rgba(0,0,0,0.06)] border-b border-black/10">
      {/* Logo */}
      <Link
        href="/"
        className="relative"
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

      {/* Profile or user bubble */}
      <div className="w-10 h-10 rounded-full flex justify-center items-center bg-blue-400 text-white text-base font-semibold hover:opacity-90 transition-opacity">
        M
      </div>
    </nav>
  );
}
