'use client';

import FitFolioNavbarDesktop from "@/components/navbar/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <FitFolioNavbarDesktop
          isAuthenticated={false}
          onNavigate={(path) => console.log("navigate:", path)}
          onLogin={() => console.log("login")}
          onSignup={() => console.log("signup")}
          onLogout={() => console.log("logout")}
        />
    </>
  );
}
