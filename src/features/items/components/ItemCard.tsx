'use client';

import Image from 'next/image';
import { Star, Eye, MessageCircle } from 'lucide-react';
import { ItemFullResponse, ItemResponse } from '../types/items.types';
import Link from 'next/link';

interface ItemCardProps {
  item: ItemFullResponse;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.item.slug}`} className="block">
      <div className="w-[260px] min-h-[260px] h-full bg-ff-black rounded-lg overflow-hidden flex flex-col hover:opacity-90 transition-opacity">
        {/* Product Image */}
        <div className="relative min-h-[200px] w-full flex-shrink-0 overflow-hidden">
          <Image
            src={item.item.imageUrl ? item.item.imageUrl : '/tnf-jacket.jpg'}
            alt={item.item.name}
            fill
            // className="h-full w-full scale-150 object-contain hover:scale-120 transition-all duration-700"
            className="object-contain"
            sizes="208px"
            
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-3">
          {/* Title */}
          <h3 className="text-white text-[16px] font-medium line-clamp-2 mb-3 text-center truncate">
            {item.item.name}
          </h3>

          {/* Engagement Metrics */}
          <div className="flex items-center justify-center gap-4">
            {/* Rating (or like count fallback) */}
            <div className="flex flex-col items-center gap-1">
              <Star className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
              <span className="text-white text-[14px]">
                {item.item.rating != null ? Number(item.item.rating).toFixed(1) : formatCount(item.item.likeCount)}
              </span>
            </div>

            {/* View Count */}
            <div className="flex flex-col items-center gap-1">
              <Eye className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
              <span className="text-white text-[14px]">
                {formatCount(item.item.viewCount)}
              </span>
            </div>

            {/* Comment Count */}
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
              <span className="text-white text-[14px]">
                {formatCount(item.item.commentCount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

