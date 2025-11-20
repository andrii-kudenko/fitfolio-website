'use client';

import FitFolioNavbarDesktop from "@/components/navbar/Navbar";
import Banner from "@/components/Banner";
import ScrollableItemList from "@/features/items/components/ScrollableItemList";
import Image from "next/image";
import { useState } from "react";
import { Item } from "@/features/items/lib/types";

const recommendedItems: Item[] = [
  {
    id: "a1b2c3d4-e5f6-1234-5678-abcdefabcdef",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "north-face-puffer",
    description: "Warm, popular puffer jacket for winter",
    source_url: "https://thenorthface.com/puffer",
    sub_title: "Classic Puffer",
    fit: "Regular",
    materials: "Nylon, Down",
    department: "Men",
    collection: "Winter 2024",
    price: 289,
    details: ["Packable", "Water resistant", "Comfy collar"],
    title: "The North Face 1996 Retro Nuptse Jacket",
    brand_id: "abc-brand-123-brand-id-xyz",
    category_id: "cat-jackets-1111-test-uuid",
    image_url: "/tnf-jacket.jpg",
    contributor_id: "user-foo-bar-id",
    comment_count: 15,
    view_count: 2403,
    like_count: 450,
  },
  {
    id: "b2c3d4e5-f6a1-2345-6789-bcdefabcdefa",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "uniqlo-flannel-shirt",
    description: "Affordable, soft flannel. Easy everyday style.",
    source_url: "https://uniqlo.com/flannel",
    sub_title: "Checked Flannel",
    fit: "Relaxed",
    materials: "Cotton",
    department: "Women",
    collection: "Fall 2023",
    price: 29,
    details: ["Machine washable", "Two pockets", "Soft touch"],
    title: "Uniqlo Women Flannel Checked Long-Sleeve Shirt",
    brand_id: "uniqlo-brand-uuid-test-id",
    category_id: "cat-shirts-2222-test-uuid",
    image_url: "",
    contributor_id: "user-bar-baz-id",
    comment_count: 6,
    view_count: 516,
    like_count: 48,
  },
  {
    id: "c3d4e5f6-a1b2-3456-789a-cdefabcdefab",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "levi-501-original",
    description: "The iconic straight-leg jean, globally loved.",
    source_url: "https://levi.com/501",
    sub_title: null,
    fit: "Straight",
    materials: "Cotton Denim",
    department: "Unisex",
    collection: "Classic",
    price: 79,
    details: ["Button fly", "Signature leather patch"],
    title: "Levi's 501 Original Fit Jeans",
    brand_id: "levis-brand-test-uuid",
    category_id: "cat-jeans-3333-test-uuid",
    image_url: "",
    contributor_id: "user-xyz-foo-id",
    comment_count: 23,
    view_count: 3100,
    like_count: 920,
  },
  {
    id: "d4e5f6a1-b2c3-4567-89ab-defabcdefabc",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "nike-airforce-1",
    description: "Classic all-white sneaker for every outfit.",
    source_url: "https://nike.com/air-force-1",
    sub_title: "Iconic Sneaker",
    fit: "True to size",
    materials: "Leather, Rubber",
    department: "Men",
    collection: "Spring 2024",
    price: 110,
    details: ["Padded collar", "Perforated toe"],
    title: "Nike Air Force 1 '07",
    brand_id: "nike-brand-uuid-id",
    category_id: "cat-shoes-4444-test-uuid",
    image_url: "",
    contributor_id: "user-abc-def-id",
    comment_count: 34,
    view_count: 4055,
    like_count: 1500,
  },
  {
    id: "d4e5f6a1-b2c3-4567-89ab-defabcdefabw",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "nike-airforce-1",
    description: "Classic all-white sneaker for every outfit.",
    source_url: "https://nike.com/air-force-1",
    sub_title: "Iconic Sneaker",
    fit: "True to size",
    materials: "Leather, Rubber",
    department: "Men",
    collection: "Spring 2024",
    price: 110,
    details: ["Padded collar", "Perforated toe"],
    title: "Nike Air Force 1 '07",
    brand_id: "nike-brand-uuid-id",
    category_id: "cat-shoes-4444-test-uuid",
    image_url: "",
    contributor_id: "user-abc-def-id",
    comment_count: 34,
    view_count: 4055,
    like_count: 1500,
  },
  {
    id: "d4e5f6ad-b2c3-4567-89ab-defabcdefabw",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "nike-airforce-1",
    description: "Classic all-white sneaker for every outfit.",
    source_url: "https://nike.com/air-force-1",
    sub_title: "Iconic Sneaker",
    fit: "True to size",
    materials: "Leather, Rubber",
    department: "Men",
    collection: "Spring 2024",
    price: 110,
    details: ["Padded collar", "Perforated toe"],
    title: "Nike Air Force 1 '07",
    brand_id: "nike-brand-uuid-id",
    category_id: "cat-shoes-4444-test-uuid",
    image_url: "",
    contributor_id: "user-abc-def-id",
    comment_count: 34,
    view_count: 4055,
    like_count: 1500,
  },
  {
    id: "d4e5f6ad-b2c3-4567-9ab-defabcdefabw",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "nike-airforce-1",
    description: "Classic all-white sneaker for every outfit.",
    source_url: "https://nike.com/air-force-1",
    sub_title: "Iconic Sneaker",
    fit: "True to size",
    materials: "Leather, Rubber",
    department: "Men",
    collection: "Spring 2024",
    price: 110,
    details: ["Padded collar", "Perforated toe"],
    title: "Nike Air Force 1 '07",
    brand_id: "nike-brand-uuid-id",
    category_id: "cat-shoes-4444-test-uuid",
    image_url: "",
    contributor_id: "user-abc-def-id",
    comment_count: 34,
    view_count: 4055,
    like_count: 1500,
  },
  {
    id: "d4e5fad-b2c3-4567-89ab-defabcdefabw",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "nike-airforce-1",
    description: "Classic all-white sneaker for every outfit.",
    source_url: "https://nike.com/air-force-1",
    sub_title: "Iconic Sneaker",
    fit: "True to size",
    materials: "Leather, Rubber",
    department: "Men",
    collection: "Spring 2024",
    price: 110,
    details: ["Padded collar", "Perforated toe"],
    title: "Nike Air Force 1 '07",
    brand_id: "nike-brand-uuid-id",
    category_id: "cat-shoes-4444-test-uuid",
    image_url: "",
    contributor_id: "user-abc-def-id",
    comment_count: 34,
    view_count: 4055,
    like_count: 1500,
  },
  {
    id: "d4e5f6ad-b2cd-4567-89ab-defabcdefabw",
    created_at: new Date(),
    updated_at: new Date(),
    status: "active",
    slug: "nike-airforce-1",
    description: "Classic all-white sneaker for every outfit.",
    source_url: "https://nike.com/air-force-1",
    sub_title: "Iconic Sneaker",
    fit: "True to size",
    materials: "Leather, Rubber",
    department: "Men",
    collection: "Spring 2024",
    price: 110,
    details: ["Padded collar", "Perforated toe"],
    title: "Nike Air Force 1 '07",
    brand_id: "nike-brand-uuid-id",
    category_id: "cat-shoes-4444-test-uuid",
    image_url: "",
    contributor_id: "user-abc-def-id",
    comment_count: 34,
    view_count: 4055,
    like_count: 1500,
  }
];

export default function Home() {

  const [isSearching, setIsSearching] = useState(false);
  return (
    <>
      <FitFolioNavbarDesktop
          isAuthenticated={false}
          onNavigate={(path) => console.log("navigate:", path)}
          onLogin={() => console.log("login")}
          onSignup={() => console.log("signup")}
          onLogout={() => console.log("logout")}
          onSearch={() => setIsSearching(!isSearching)}
          isSearching={isSearching}
        />
      
      {/* Hero Section */}
      <section className="min-h-screen bg-ff-black flex items-center justify-center">
        <div className={`absolute top-0 left-0 w-full h-full ${isSearching ? " bg-black/70" : ""}`}></div>
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight">
            Rate. Compare. Discover what{' '}
            <span className="text-ff-cyan">fits</span>
            {' '}you best.
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            A community-powered hub for honest fashion reviews, curated collections, and personalized style recommendations
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center justify-center wrap">

        {/* Content Frame */}
        <div className="w-full items-center justify-center flex flex-col gap-20 px-50">
          {/* Banner Section */}
          <Banner />

          {/* Recommended For You */}
          <ScrollableItemList items={recommendedItems} title="Recommended For You" />
          
          {/* Trending Now */}
          <ScrollableItemList items={recommendedItems} title="Trending Now" />
          
        </div>
      </section>
    </>
  );
}
