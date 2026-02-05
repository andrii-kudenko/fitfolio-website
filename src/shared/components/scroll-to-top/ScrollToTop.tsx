'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scrolls the window to the top whenever the route (pathname) changes.
 * Add to a layout or page so that navigating to a new page doesn't leave
 * the user scrolled down from the previous page.
 *
 * Usage:
 *   In layout:  <ScrollToTop />
 *   In a page:   <ScrollToTop />
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
