'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // For now, we'll use a single banner image
  // You can extend this to support multiple slides later
  const slides = [
    {
      image: '/banner.jpg',
      title: 'White Neutral',
      ctaText: 'Discover New Collection',
      ctaLink: '/items',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentBanner = slides[currentSlide];

  return (
    <div className="relative w-full h-[250px] overflow-hidden">
      {/* Background Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.image}
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        
        {/* Overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      {/* Background Text - Faintly visible */}
      <div className="absolute top-8 right-8">
        <p className="text-white/20 text-4xl font-light tracking-wider">
          {currentBanner.title}
        </p>
      </div>

      {/* Navigation Chevrons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-ff-black/80 hover:bg-ff-black rounded-full p-2 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-ff-black/80 hover:bg-ff-black rounded-full p-2 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* CTA Button - Centered horizontally, towards bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <Link href={currentBanner.ctaLink}>
          <button className="bg-ff-black/90 hover:bg-ff-black text-white px-6 py-3 rounded-lg font-medium transition-colors">
            {currentBanner.ctaText}
          </button>
        </Link>
      </div>
    </div>
  );
}

