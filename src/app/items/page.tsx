'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { itemsApi } from '@/features/items/api/items.api';
import type { ItemFullResponse } from '@/features/items/types/items.types';
import ItemCard from '@/features/items/components/ItemCard';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'RELEVANCE' },
  { value: 'newest', label: 'NEWEST' },
  { value: 'rating', label: 'HIGHEST RATING' },
  { value: 'price-asc', label: 'PRICE: LOW TO HIGH' },
  { value: 'price-desc', label: 'PRICE: HIGH TO LOW' },
];

export default function ItemsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';

  const [items, setItems] = useState<ItemFullResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  useEffect(() => {
    setLoading(true);
    itemsApi
      .getTopRecommended()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let list = [...items];

    if (q.trim()) {
      const lower = q.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.item.name.toLowerCase().includes(lower) ||
          (i.brand?.name?.toLowerCase().includes(lower) ?? false)
      );
    }

    if (filterCategory) {
      const cat = filterCategory.toLowerCase();
      list = list.filter((i) => i.category?.name?.toLowerCase().includes(cat) ?? false);
    }
    if (filterBrand) {
      const brand = filterBrand.toLowerCase();
      list = list.filter((i) => i.brand?.name?.toLowerCase().includes(brand) ?? false);
    }
    if (filterRating) {
      const minRating = Number(filterRating);
      list = list.filter((i) => (i.item.rating ?? 0) >= minRating);
    }
    if (filterPrice) {
      const [low, high] = filterPrice === '200+' ? [200, Infinity] : filterPrice.split('-').map(Number);
      list = list.filter((i) => {
        const p = i.item.price ?? 0;
        return p >= low && p <= (high === Infinity ? 1e9 : high);
      });
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime());
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.item.rating ?? 0) - (a.item.rating ?? 0));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.item.price ?? 0) - (b.item.price ?? 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.item.price ?? 0) - (a.item.price ?? 0));
    }

    return list;
  }, [items, q, sortBy, filterCategory, filterBrand, filterRating, filterPrice]);

  return (
    <main className="bg-black text-white pt-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/items" className="text-white underline">
              Search
            </Link>
          </div>
        </nav>

        {/* Filter and Sort Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <span className="text-white/60 text-sm font-medium">FILTER BY</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer min-w-[140px]"
              >
                <option value="">CATEGORY</option>
                <option value="shoes">Shoes</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer min-w-[120px]"
              >
                <option value="">BRAND</option>
                <option value="nike">Nike</option>
                <option value="tnf">The North Face</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer min-w-[120px]"
              >
                <option value="">RATING</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
                <option value="6">6+</option>
                <option value="7">7+</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer min-w-[120px]"
              >
                <option value="">PRICE</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200+">$200+</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white/60 text-sm font-medium">SORT BY</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-8 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm focus:border-ff-cyan focus:outline-none cursor-pointer min-w-[160px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Item Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[260px] min-h-[260px] bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-16 text-white/60">
            No items found. Try a different search or filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item) => (
              <ItemCard key={item.item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
