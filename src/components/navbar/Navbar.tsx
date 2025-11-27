'use client';

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, ChevronUp, User2 } from "lucide-react";
import SearchIcon from "./SearchIcon";
import NavbarChevron from "./NavbarChevron";
import Image from "next/image";
import { searchItems, getItemTitle, type SearchItem } from "@/lib/search";

/**
 * FitFolio Navbar (Desktop)
 * ------------------------------------------
 * - Dark-only, modern aesthetic
 * - Centered primary nav: Home · Items · (Search icon) · Lists · Community
 * - Right-aligned Profile menu ("Pro" with chevron)
 * - Search bar appears centered below navbar when search icon is clicked
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
  onSearch?: () => void;
  isSearching?: boolean;
};

export default function FitFolioNavbarDesktop({
  isAuthenticated,
  onNavigate,
  onLogin,
  onSignup,
  onLogout,
  onSearch,
  isSearching: isSearchingProp,
}: NavbarDesktopProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Internal state for search if not controlled by parent
  const [internalSearching, setInternalSearching] = useState(false);
  // Use prop if provided, otherwise use internal state
  const isSearching = isSearchingProp !== undefined ? isSearchingProp : internalSearching;
  
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchIconBtnRef = useRef<HTMLButtonElement | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);

  // Close profile menu on outside click
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

  // Close search bar on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!isSearching) return;
      const t = e.target as Node;
      // Don't close if clicking on the search bar or the search icon button itself
      if (searchRef.current?.contains(t) || searchIconBtnRef.current?.contains(t)) return;
      if (onSearch) {
        onSearch();
      } else {
        setInternalSearching(false);
        setSearchInput("");
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isSearching, onSearch]);

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        if (isSearching) {
          if (onSearch) {
            onSearch();
          } else {
            setInternalSearching(false);
            setSearchInput("");
            setSearchResults([]);
          }
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSearching, onSearch]);

  // Search items when input changes
  useEffect(() => {
    let isCancelled = false;
    
    if (searchInput.trim()) {
      searchItems(searchInput, 10).then(results => {
        if (!isCancelled) {
          setSearchResults(results);
        }
      });
    } else {
      setSearchResults([]);
    }
    
    return () => {
      isCancelled = true;
    };
  }, [searchInput]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  const handleSearchClick = () => {
    console.log("search clicked");
    if (onSearch) {
      onSearch();
    } else {
      setInternalSearching(prev => {
        const newValue = !prev;
        // Clear search input when closing
        if (!newValue) {
          setSearchInput("");
          setSearchResults([]);
        }
        return newValue;
      });
    }
    console.log(isSearching);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-ff-black backdrop-blur supports-[backdrop-filter]:bg-ff-black/80 ">
      <div className="mx-auto flex items-center justify-between px-8 relative py-3">
        {/* Left spacer for centering */}
        <div className="flex-1"></div>

        {/* Center nav */}
        <nav className="hidden md:flex items-center justify-center flex-1">
          <ul className="flex items-center gap-12">
            <li>
              <button
                onClick={() => handleNavigate("/")}
                className="px-1.5 py-1 text-[20px] font-medium text-white/85 transition ring-ff-cyan relative hover:text-white 
                after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-ff-cyan after:transition-opacity 
                after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100"
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate("/items")}
                className="px-1.5 py-1 text-[20px] font-medium text-white/85 transition ring-ff-cyan relative hover:text-white 
                after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-ff-cyan after:transition-opacity 
                after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100"
              >
                Items
              </button>
            </li>
            <li className="relative">
              <button
                ref={searchIconBtnRef}
                onClick={handleSearchClick}
                className={`rounded-xl px-1.5 py-1 text-[20px] font-medium text-white/85 outline-none transition-all duration-300 hover:text-white 
                  ring-offset-2 ${isSearching ? "rotate-45" : ""}`}
                  aria-label="Search"
              >
                <SearchIcon />
              </button>

              {/* Search Bar - appears below navbar when clicked */}
              {isSearching && (
                <div 
                  ref={searchRef}
                  className="absolute top-1/2 translate-y-2 left-1/2 -translate-x-1/2 w-[550px] max-w-2xl px-4 pb-4 z-40"
                >
                  {/* Chevron pointing down from navbar */}
                  <div className="flex justify-center ">
                    <div className="translate-y-3 z-20">
                      <NavbarChevron />
                    </div>
                  </div>
                  
                  {/* Search input */}
                  <div className="relative z-10">
                    
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Nike Jordan"
                      className="w-full h-12 px-4 rounded-full bg-[#000500] text-white placeholder:text-white/40 outline-none  ring-2 ring-ff-cyan transition duration-300"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>

                  {searchInput.trim() && (
                    <div className="bg-[#55C1FF]/3 p-4 rounded-3xl w-full mt-4 flex flex-col gap-4 items-center justify-center ">
                      <div className="bg-[#111729] w-full rounded-full px-6 py-3 overflow-hidden
                      flex items-center justify-between">
                        <div className="flex rounded-full px-8 py-1 bg-white/6">
                          <span>Items {searchResults.length > 0 && `(${searchResults.length})`}</span>
                        </div>
                        <div className="flex rounded-full px-8 py-1 bg-white/6 items-center gap-2">
                          <span>Search with filters</span>
                          <svg width="20" height="20" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.2064 9.71499C6.12746 10.0096 5.83069 10.3442 5.54427 10.4279L4.74557 10.685C4.00807 10.9066 3.24682 10.2316 3.45647 9.4492L4.14881 6.86535C4.24069 6.52244 4.16526 6.03118 4.03195 5.73664L2.70018 3.28854C2.51986 2.97623 2.44316 2.4898 2.5221 2.1952L2.82233 1.07472C2.97892 0.490334 3.53619 0.168608 4.07227 0.312252L10.515 2.03856C11.051 2.18221 11.3728 2.73948 11.2292 3.27557L10.9419 4.34774C10.8371 4.73894 10.4601 5.16074 10.1539 5.33752" stroke="#55C1FF" strokeWidth="0.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.38132 8.70985C8.23486 8.93855 9.11221 8.43202 9.34091 7.57848C9.56962 6.72493 9.06308 5.84759 8.20954 5.61888C7.356 5.39018 6.47866 5.89671 6.24995 6.75025C6.02125 7.60379 6.52778 8.48114 7.38132 8.70985Z" stroke="#55C1FF" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.1392 9.4914L8.78564 8.87903" stroke="#55C1FF" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>                      
                      </div>
                      
                      <div className=" py-2 max-h-[500px] w-full flex flex-col gap-2 overflow-y-auto scrollbar-hide">
                        
                      {searchResults.length === 0 ? (
                        <div className="bg-[#111729] w-full rounded-3xl px-6 py-6 text-center">
                          <p className="text-white/60 w-full">No items found. Try a different search.</p>
                        </div>
                      ) : (
                        searchResults.map((item, index) => {
                          const title = getItemTitle(item);
                          const imageUrl = item.image || '/nike-shoes.jpg';
                          const price = item.price || 'Price not available';
                          
                          return (
                            <div 
                              key={index}
                              className="bg-[#111729] w-full flex items-center
                              px-6 py-6 rounded-3xl gap-4 hover:bg-[#1a2332] transition-colors cursor-pointer"
                              onClick={() => {
                                if (item.url && onNavigate) {
                                  // You might want to navigate to an item detail page instead
                                  // onNavigate(`/items/${item.slug || item.id}`);
                                  window.open(item.url, '_blank');
                                }
                              }}
                            >
                              <div className="rounded-xl bg-white/6 overflow-hidden flex-shrink-0">
                                <Image 
                                  src={imageUrl} 
                                  alt={title} 
                                  width={100} 
                                  height={100}
                                  className="object-cover"
                                  onError={(e) => {
                                    // Fallback to default image if image fails to load
                                    e.currentTarget.src = '/nike-shoes.jpg';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[20px] text-white truncate">{title}</p>
                                <span className="text-[16px] text-white/70">{price}</span>
                                {item.description && (
                                  <p className="text-[14px] text-white/50 mt-1 line-clamp-2">
                                    {item.description.substring(0, 100)}...
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </li>
            <li>
              <button
                onClick={() => handleNavigate("/lists")}
                className="px-1.5 py-1 text-[20px] font-medium text-white/85 transition ring-ff-cyan relative hover:text-white 
                after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-ff-cyan after:transition-opacity 
                after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100"
              >
                Lists
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate("/community")}
                className="px-1.5 py-1 text-[20px] font-medium text-white/85 transition ring-ff-cyan relative hover:text-white 
                after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-ff-cyan after:transition-opacity 
                after:opacity-0 hover:after:opacity-100 focus-visible:after:opacity-100"
              >
                Community
              </button>
            </li>
          </ul>
        </nav>

        {/* Right profile menu */}
        <div className="flex-1 flex justify-end">
          {true ? (
          <div className="relative">
            <button
              ref={btnRef}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[20px] font-medium text-white/85 outline-none transition hover:text-white"
            >
              <span>Account</span>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {/* Dropdown */}
            {open && (
              <div
                ref={menuRef}
                role="menu"
                aria-label="Profile menu"
                className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border-b-2 border-ff-cyan backdrop-blur shadow-xl"
              >
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
          ) : (
            <div className="relative">
              <button
                ref={btnRef}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[20px] font-medium text-white/85 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400/60 ring-offset-2"
              >
                <span>Sign In</span>                
              </button>
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
    "w-full select-none rounded-2xl px-4 py-2 text-[18px] font-medium text-left outline-none transition focus-visible:ring-2 ring-offset-2";
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
