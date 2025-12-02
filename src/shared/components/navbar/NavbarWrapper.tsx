'use client';

import { useState, useEffect } from 'react';
import FitFolioNavbarDesktop from '@/shared/components/navbar/Navbar';

export default function NavbarWrapper({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isSearching, setIsSearching] = useState(false);

  // Lock body scroll when search is open
  useEffect(() => {
    if (isSearching) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Save the current scroll position
      const scrollY = window.scrollY;
      
      // Lock the body scroll and compensate for scrollbar
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      return () => {
        // Restore scroll when search closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isSearching]);

  return (
    <>
      {/* Navbar visible on every page */}
      <FitFolioNavbarDesktop 
        isAuthenticated={isAuthenticated}
        isSearching={isSearching}
        onSearch={() => setIsSearching(prev => !prev)}
      />
      
      {/* Overlay when searching */}
      {isSearching && (
        <div className="fixed inset-0 bg-black/90 z-30" />
      )}
    </>
  );
}

