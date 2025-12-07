'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ItemResponse } from '../types/types';
import ItemCard from './ItemCard';

interface ScrollableItemListProps {
  items: ItemResponse[];
  title: string;
}

export default function ScrollableItemList({ items, title }: ScrollableItemListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
      return () => {
        container.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 700; // Adjust this value to control scroll distance
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'right' 
        ? currentScroll + scrollAmount 
        : currentScroll - scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full relative">
      <h2 className="text-[30px] font-medium text-white mb-6">{title}</h2>
      
      <div className="relative">
        {/* Left Chevron */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transform -translate-x-1/2
            bg-ff-black/80 hover:bg-ff-black rounded-full p-2 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-[40px] h-[40px] text-white" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-10 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* Right Chevron */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10
            transform translate-x-1/2
            bg-ff-black/80 hover:bg-ff-black rounded-full p-2 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-[40px] h-[40px] text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

