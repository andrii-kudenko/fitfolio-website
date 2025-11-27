'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Eye, MessageCircle, Search, ChevronRight } from 'lucide-react';

// Mock item data
const mockItem = {
  title: "Nike Zoom Vomero Roam",
  sub_title: "Winterized Running Shoe",
  price: "$110.00",
  url: "https://www.nike.com",
  image: "/nike-shoes.jpg",
  description: "Designed for city conditions, this winterized version of the Vomero is made for wet weather. Durable materials and a rubber mudguard work together to help safeguard your shoes from dirt and puddles. Plus, a chunky midsole gives you a visible boost of comfort and style wherever you wander.",
  attributes: {
    brand: "Nike",
    department: "Men's",
    collection: "Zoom",
    fit: "Regular",
    materials: "Synthetic upper with rubber outsole"
  },
  details: [
    "Water-resistant upper material",
    "Rubber mudguard for protection",
    "Chunky midsole for comfort",
    "Designed for city conditions",
    "Suitable for wet weather",
    "Durable construction"
  ],
  reviews: [
    {
      headline: "Excellent fit and quality",
      text: "Super comfortable and cool winter shoes, they fit perfectly.",
      author: "@andy",
      rating: 7,
      date: "2024-01-15"
    },
    {
      headline: "Great for wet weather",
      text: "These shoes handle rain and puddles really well. Very satisfied!",
      author: "@runner123",
      rating: 8,
      date: "2024-01-10"
    },
    {
      headline: "Comfortable daily wear",
      text: "Perfect for walking around the city. The midsole is really comfortable.",
      author: "@citywalker",
      rating: 7,
      date: "2024-01-05"
    }
  ]
};

// Mock related items
const mockRelatedItems = [
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  },
  {
    title: "The North Face Jacket",
    image: "/tnf-jacket.jpg",
    rating: 7.8,
    views: 5600,
    comments: 23
  }
];

export default function ItemPage() {
  const [imageZoom, setImageZoom] = useState(false);
  const item = mockItem;
  const relatedItems = mockRelatedItems;

  // Calculate average rating from reviews
  const ratings = item.reviews?.map(r => r.rating || 0).filter(r => r > 0) || [];
  const avgRating = ratings.length > 0 
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '7.8';
  const reviewCount = item.reviews?.length || 132;

  // Tags
  const tags = ['New', 'Runs small', 'Warm'];

  // Mock retailers data (you can replace this with actual data)
  const retailers = [
    { name: 'Nordstorm', price: item.price || '$110.00', inStock: true },
    { name: 'Hudson Bay', price: item.price ? `$${(parseFloat(item.price.replace('$', '')) + 9.99).toFixed(2)}` : '$119.99', inStock: false },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/items" className="hover:text-white">Sneakers</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white underline">{item.attributes?.brand || 'Item'}</span>
          </div>
        </nav>

        {/* Product Details Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              <div className="relative aspect-square bg-ff-black rounded-lg overflow-hidden">
                {item.image ? (
                  <>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <button
                      onClick={() => setImageZoom(!imageZoom)}
                      className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                      aria-label="Zoom image"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-white/40">No image</span>
                  </div>
                )}
              </div>
              {imageZoom && item.image && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8" onClick={() => setImageZoom(false)}>
                  <div className="relative w-full h-full max-w-4xl">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain"
                      sizes="100vw"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Status Label */}
              <div>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                  Unverified
                </span>
              </div>

              {/* Brand */}
              {item.attributes?.brand && (
                <div className="text-sm text-white/60">{item.attributes.brand}</div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-semibold">{item.title}</h1>
              {item.sub_title && (
                <p className="text-lg text-white/70">{item.sub_title}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">★{avgRating}</span>
                <span className="text-white/60">({reviewCount})</span>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1 text-sm rounded-full border border-white/20 bg-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div>
                  <p className="text-white/80 leading-relaxed">{item.description}</p>
                  <Link href="#details" className="text-ff-cyan hover:underline mt-2 inline-block">
                    View Details
                  </Link>
                </div>
              )}

              {/* Retailers */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-lg font-medium">Where to Buy</h3>
                {retailers.map((retailer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="font-medium">{retailer.name}</div>
                      <div className="text-sm text-white/60">{retailer.price}</div>
                    </div>
                    {retailer.inStock ? (
                      <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                        In stock
                      </span>
                    ) : (
                      <span className="text-xs text-white/40">Check availability</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button className="flex-1 px-6 py-3 bg-ff-cyan text-black font-medium rounded-lg hover:bg-ff-cyan/90 transition">
                  Read reviews
                </button>
                <button className="flex-1 px-6 py-3 border-2 border-white/20 text-white font-medium rounded-lg hover:border-white/40 transition">
                  Read Comments
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Details Section */}
        {item.details && item.details.length > 0 && (
          <section id="details" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Details</h2>
            <div className="bg-white/5 rounded-lg p-6">
              <ul className="space-y-2">
                {item.details.map((detail, idx) => (
                  <li key={idx} className="text-white/80">{detail}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Related Items</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {relatedItems.map((relatedItem, idx) => {
                const formatCount = (count: number) => {
                  if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
                  return count.toString();
                };
                
                return (
                  <Link
                    key={idx}
                    href="/items/related-item"
                    className="flex-shrink-0 w-[260px] min-h-[260px] bg-ff-black rounded-lg overflow-hidden flex flex-col hover:opacity-90 transition-opacity"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-[160px] flex-shrink-0">
                      {relatedItem.image ? (
                        <Image
                          src={relatedItem.image}
                          alt={relatedItem.title || ''}
                          fill
                          className="object-contain"
                          sizes="260px"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="text-white/40 text-sm">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-between py-3 px-3">
                      {/* Title */}
                      <h3 className="text-white text-[16px] font-medium line-clamp-2 mb-3 text-center">
                        {relatedItem.title || 'Untitled'}
                      </h3>

                      {/* Engagement Metrics */}
                      <div className="flex items-center justify-center gap-4">
                        {/* Rating */}
                        <div className="flex flex-col items-center gap-1">
                          <Star className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
                          <span className="text-white text-[14px]">{relatedItem.rating}</span>
                        </div>

                        {/* View Count */}
                        <div className="flex flex-col items-center gap-1">
                          <Eye className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
                          <span className="text-white text-[14px]">{formatCount(relatedItem.views)}</span>
                        </div>

                        {/* Comment Count */}
                        <div className="flex flex-col items-center gap-1">
                          <MessageCircle className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
                          <span className="text-white text-[14px]">{relatedItem.comments}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Lists that include this item */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Lists that include this item</h2>
          <div className="text-white/60">Coming soon...</div>
        </section>
      </div>
    </main>
  );
}
