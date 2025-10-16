"use client"
import React, { memo, useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import localFont from 'next/font/local';
import ButtonLink from "../ui/ButtonLink";
import { useUserStore } from "@/app/stores/useUserStores";
import {NavbarBrand, NavbarContent, NavbarItem, Button} from "@heroui/react";
import ProfileDropdown from "../ui/ProfileDropdown";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faHome, faFilm, faDollarSign, faQuestionCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

const marlonProBold = localFont({
  src: "../../../../public/fonts/marlonProBold.ttf",
})

const certaSansMedium = localFont({
  src: "../../../../public/fonts/certaSansMedium.otf",
})

function Navbar() {
  const user = useUserStore((s) => s.user);
  const isLoading = useUserStore((s) => s.isLoading);

  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Hide nav links in editor/player for distraction-free experience
  const isEditorOrPlayer = pathname.startsWith('/editor') || pathname.startsWith('/play')

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuItemClick = (path: string) => {
    setIsMenuOpen(false)
    if (path.startsWith('/#')) {
      // Handle hash links
      if (pathname === '/') {
        const id = path.substring(2)
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        router.push(path)
      }
    } else {
      router.push(path)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-[75px] pb-50px backdrop-blur-lg z-50">
      <div className={`navbar ${isEditorOrPlayer ? 'px-8' : 'px-8 max-w-[95rem] mx-auto'}`}>
        <div className="navbar-start">
          {isEditorOrPlayer ? (
            <div className="relative" ref={menuRef}>
              {/* Animated Hamburger/X Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-12 h-12 rounded-full border-2 border-black bg-white hover:bg-black transition-all duration-300 flex items-center justify-center shadow-md group"
              >
                <div className="relative w-5 h-5">
                  {/* Top bar */}
                  <span className={`absolute left-0 h-0.5 w-5 bg-black group-hover:bg-white transition-all duration-300 ${
                    isMenuOpen ? 'top-2 rotate-45' : 'top-0 rotate-0'
                  }`}></span>
                  {/* Middle bar */}
                  <span className={`absolute left-0 top-2 h-0.5 bg-black group-hover:bg-white transition-all duration-300 ${
                    isMenuOpen ? 'w-0 opacity-0' : 'w-5 opacity-100'
                  }`}></span>
                  {/* Bottom bar */}
                  <span className={`absolute left-0 h-0.5 w-5 bg-black group-hover:bg-white transition-all duration-300 ${
                    isMenuOpen ? 'top-2 -rotate-45' : 'top-4 rotate-0'
                  }`}></span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                  /* Menu - matching scene heading dropdown with tan gradient */
                  <div className="absolute left-0 top-[60px] w-72 bg-gradient-to-br from-[#e9dfd2] to-[#f2e9dc] rounded-2xl border-4 border-black shadow-2xl z-50 overflow-hidden mt-3 animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-300">
                    <div className="p-2">
                      <button
                        onClick={() => handleMenuItemClick('/')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 text-left group ${sunsetSerialMediumFont.className}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#b8a082] group-hover:bg-[#ffa05a] flex items-center justify-center transition-all duration-200">
                          <FontAwesomeIcon icon={faHome} className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-[#2c5aa0] transition-colors">Home</span>
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/scenes')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 text-left group ${sunsetSerialMediumFont.className}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#b8a082] group-hover:bg-[#72a4f2] flex items-center justify-center transition-all duration-200">
                          <FontAwesomeIcon icon={faFilm} className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-[#2c5aa0] transition-colors">My Scenes</span>
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/#pricing')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 text-left group ${sunsetSerialMediumFont.className}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#b8a082] group-hover:bg-[#ffa05a] flex items-center justify-center transition-all duration-200">
                          <FontAwesomeIcon icon={faDollarSign} className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-[#2c5aa0] transition-colors">Pricing</span>
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/#faq')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 text-left group ${sunsetSerialMediumFont.className}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#b8a082] group-hover:bg-[#72a4f2] flex items-center justify-center transition-all duration-200">
                          <FontAwesomeIcon icon={faQuestionCircle} className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-[#2c5aa0] transition-colors">FAQ</span>
                      </button>
                      <button
                        onClick={() => handleMenuItemClick('/contact')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/60 transition-all duration-200 text-left group ${sunsetSerialMediumFont.className}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#b8a082] group-hover:bg-[#ffa05a] flex items-center justify-center transition-all duration-200">
                          <FontAwesomeIcon icon={faEnvelope} className="text-white text-sm" />
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-[#2c5aa0] transition-colors">Contact</span>
                      </button>
                    </div>
                  </div>
              )}
            </div>
          ) : (
            <Link href="/" className={`text-2xl font-bold ${marlonProBold.className}`}>Rehearsely</Link>
          )}
        </div>
      <div className="navbar-end flex items-center gap-20">
        {user && !isEditorOrPlayer && (
          <>
            <Link
              href="/scenes"
              className={`text-lg font-semibold text-gray-800 hover:text-[#72a4f2] active:scale-95 active:text-[#5a8de8] transition-all duration-200 tracking-wide ${sunsetSerialMediumFont.className}`}
            >
              My Scenes
            </Link>
            <Link
              href="/#pricing"
              className={`text-lg font-semibold text-gray-800 hover:text-[#72a4f2] active:scale-95 active:text-[#5a8de8] transition-all duration-200 tracking-wide ${sunsetSerialMediumFont.className}`}
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className={`text-lg font-semibold text-gray-800 hover:text-[#72a4f2] active:scale-95 active:text-[#5a8de8] transition-all duration-200 tracking-wide ${sunsetSerialMediumFont.className}`}
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className={`text-lg font-semibold text-gray-800 hover:text-[#72a4f2] active:scale-95 active:text-[#5a8de8] transition-all duration-200 tracking-wide ${sunsetSerialMediumFont.className}`}
            >
              Contact
            </Link>
          </>
        )}
         {isLoading ? (
           <div className="btn btn-lg default-btn black relative z-0 opacity-50 cursor-not-allowed">Loading...</div>
         ) : user ? (
           <ProfileDropdown />
         ) : (
           <Link href="/login" className="btn btn-lg default-btn black relative z-0 active:scale-95 transition-transform duration-200">Log in</Link>
         )}
        </div>
      </div>
    </div>
  );
}

export default memo(Navbar);

// export const AcmeLogo = () => {
//   return (
//     <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
//       <path
//         clipRule="evenodd"
//         d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
//         fill="currentColor"
//         fillRule="evenodd"
//       />
//     </svg>
//   );
// };

// export default function App() {
//   return (
//     <Navbar shouldHideOnScroll>
//       <NavbarBrand>
//         <AcmeLogo />
//         <p className="font-bold text-inherit">ACME</p>
//       </NavbarBrand>
//       <NavbarContent className="hidden sm:flex gap-4" justify="center">
//         <NavbarItem>
//           <Link color="foreground" href="#">
//             Features
//           </Link>
//         </NavbarItem>
//         <NavbarItem isActive>
//           <Link aria-current="page" href="#">
//             Customers
//           </Link>
//         </NavbarItem>
//         <NavbarItem>
//           <Link color="foreground" href="#">
//             Integrations
//           </Link>
//         </NavbarItem>
//       </NavbarContent>
//       <NavbarContent justify="end">
//         <NavbarItem className="hidden lg:flex">
//           <Link href="#">Login</Link>
//         </NavbarItem>
//         <NavbarItem>
//           <Button as={Link} color="primary" href="#" variant="flat">
//             Sign Up
//           </Button>
//         </NavbarItem>
//       </NavbarContent>
//     </Navbar>
//   );
// }

// <Link
//         href="/"
//         className="relative mr-auto"
//         style={{ width: "200px", height: "60px" }}
//       >
//         <Image
//           src="/logo-2.png"
//           alt="Rehearsely logo"
//           fill
//           style={{ objectFit: "contain" }}
//           sizes="(max-width: 768px) 150px, 200px"
//         />
//       </Link>

// {user ? 
//           <Button className="bg-[#f47c2c] rounded-md text-white hover:bg-[#d96b22] transition-all duration-300 ease-in-out" color="default" variant="flat" onPress={handleLogout}>
//               Logout
//           </Button> :
//           <Button className="bg-[#f47c2c] rounded-md text-white hover:bg-[#d96b22] transition-all duration-300 ease-in-out" href="/signin" as={Link}>Login</Button>
//           }