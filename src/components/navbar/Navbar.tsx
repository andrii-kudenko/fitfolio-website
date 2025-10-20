'use client';

import React, { useEffect, useRef, useState } from "react";
import { Search, ChevronDown, ChevronUp, User2 } from "lucide-react";

/**
 * FitFolio Navbar (Desktop)
 * ------------------------------------------
 * - Dark-only, modern aesthetic
 * - Centered primary nav: Home · Items · (Search icon) · Lists · Community
 * - Right-aligned Profile menu with two variants (logged in / logged out)
 * - Accessible: focus rings, keyboard nav, ESC/ClickOutside to close menu
 * - TailwindCSS recommended
 *
 * Props:
 *  - isAuthenticated: boolean
 *  - onNavigate?: (path: string) => void
 *  - onLogin?: () => void
 *  - onSignup?: () => void
 *  - onLogout?: () => void
 */

export type NavbarDesktopProps = {
  isAuthenticated: boolean;
  onNavigate?: (path: string) => void;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
};

const navItems = [
  { label: "Home", path: "/" },
  { label: "Items", path: "/items" },
  { label: "Lists", path: "/lists" },
  { label: "Community", path: "/community" },
];

export default function FitFolioNavbarDesktop({
  isAuthenticated,
  onNavigate,
  onLogin,
  onSignup,
  onLogout,
}: NavbarDesktopProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleNavigate = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0B0B]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0A0B0B]/80 border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left placeholder for logo */}
        <button
          onClick={() => handleNavigate("/")}
          className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 text-sm font-semibold text-white/90 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-400/60"
          aria-label="Go to home"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-b from-indigo-400 to-violet-500 text-black font-bold">
            F
          </span>
          <span className="tracking-wide">FitFolio</span>
        </button>

        {/* Center nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className="rounded-xl px-1.5 py-1 text-[15px] font-medium text-white/85 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400/60 ring-offset-2"
                >
                  {item.label}
                </button>
              </li>
            ))}
            {/* Search icon */}
            <li>
              <button
                onClick={() => handleNavigate("/search")}
                className="group inline-flex items-center gap-2 rounded-xl px-1.5 py-1 text-[15px] font-medium text-white/85 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400/60 ring-offset-2"
                aria-label="Search"
              >
                <Search className="h-5 w-5 transition group-hover:scale-105" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Right profile menu */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-haspopup="menu"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0C0D0D] px-3 py-1.5 text-sm font-medium text-white/90 shadow-sm outline-none transition hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-cyan-400/60 ring-offset-2"
          >
            <User2 className="h-4 w-4" />
            <span>Profile</span>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {/* Dropdown */}
          {open && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Profile menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0C0C]/95 backdrop-blur shadow-xl ring-1 ring-sky-400/30"
            >
              {/* Fancy glow edge to mimic the reference screenshot */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent [background:linear-gradient(180deg,rgba(59,130,246,0.3),rgba(139,92,246,0.25),rgba(34,197,94,0.25))_border-box] [mask:linear-gradient(#000_0_0)_padding-box,linear-gradient(#000_0_0)] [mask-composite:exclude]"></div>

              <div className="relative p-1">
                {isAuthenticated ? (
                  <>
                    <MenuItem label="Collections" onClick={() => { setOpen(false); handleNavigate("/collections"); }} />
                    <MenuItem label="Settings" onClick={() => { setOpen(false); handleNavigate("/settings"); }} />
                    <MenuItem label="Log Out" onClick={() => { setOpen(false); onLogout?.(); }} destructive />
                  </>
                ) : (
                  <>
                    <MenuItem label="Log In" onClick={() => { setOpen(false); onLogin?.(); }} />
                    <MenuItem label="Sign Up" onClick={() => { setOpen(false); onSignup?.(); }} primary />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  label,
  onClick,
  primary,
  destructive,
}: {
  label: string;
  onClick?: () => void;
  primary?: boolean;
  destructive?: boolean;
}) {
  const base =
    "w-full select-none rounded-2xl px-4 py-2 text-sm font-medium text-left outline-none transition focus-visible:ring-2 ring-offset-2";
  const palette = destructive
    ? "text-red-300 hover:text-red-200 hover:bg-red-400/10 focus-visible:ring-red-400/50"
    : primary
    ? "text-white hover:text-white hover:bg-sky-400/10 focus-visible:ring-cyan-400/60"
    : "text-white/90 hover:text-white hover:bg-white/5 focus-visible:ring-sky-400/40";

  return (
    <button className={`${base} ${palette}`} onClick={onClick} role="menuitem">
      {label}
    </button>
  );
}
