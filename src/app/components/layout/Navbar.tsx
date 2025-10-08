"use client"
import React from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import Image from "next/image";
import localFont from 'next/font/local';
import ButtonLink from "../ui/ButtonLink";
import { useUserStore } from "@/app/stores/useUserStores";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button} from "@heroui/react";
import ProfileDropdown from "../ui/ProfileDropdown";

const sunsetSerialMediumFont = localFont({
    src: "../../../../public/fonts/sunsetSerialMedium.ttf",
})

const marlonProBold = localFont({
  src: "../../../../public/fonts/marlonProBold.ttf",
})

export default function Navbar2() {

  const user = useUserStore((s) => s.user);
  const isLoading = useUserStore((s) => s.isLoading); 

  const router = useRouter()

{/* <Link
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
      </Link> */}

const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

  return (
    <div className="navbar fixed top-0 left-0 right-0 max-w-[1440px] mx-auto h-[75px] pb-50px backdrop-blur-lg z-10">
      <div className="navbar-start">
        <Link href="/" className="text-2xl font-bold">Rehearsely</Link>
      </div>
      <div className="navbar-end">
         {isLoading ? (
           <div className="btn btn-lg default-btn black relative z-0 opacity-50 cursor-not-allowed">Loading...</div>
         ) : user ? (
           <ProfileDropdown />
         ) : (
           <Link href="/login" className="btn btn-lg default-btn black relative z-0">Log in</Link>
         )}
      </div>
    </div>
  );
}

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