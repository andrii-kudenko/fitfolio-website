'use client';

import Image from 'next/image';
import { Star, Eye, MessageCircle } from 'lucide-react';
import { ItemResponseDTO } from '../types/types';
import Link from 'next/link';

interface ItemCardProps {
  item: ItemResponseDTO;
}

function formatCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
}

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link href={`/items/${item.slug}`} className="block">
      <div className="w-[260px] min-h-[260px] bg-ff-black rounded-lg overflow-hidden flex flex-col hover:opacity-90 transition-opacity">
        {/* Product Image */}
        <div className="relative w-full h-[160px] flex-shrink-0">
          <Image
            src={item.image_url ? item.image_url : '/tnf-jacket.jpg'}
            alt={item.title}
            fill
            className="object-contain"
            sizes="208px"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-3">
          {/* Title */}
          <h3 className="text-white text-[16px] font-medium line-clamp-2 mb-3 text-center">
            {item.title}
          </h3>

          {/* Engagement Metrics */}
          <div className="flex items-center justify-center gap-4">
            {/* Like Count / Rating */}
            <div className="flex flex-col items-center gap-1">
              <Star className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
              <span className="text-white text-[14px]">
                {formatCount(item.like_count)}
              </span>
            </div>

            {/* View Count */}
            <div className="flex flex-col items-center gap-1">
              <Eye className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
              <span className="text-white text-[14px]">
                {formatCount(item.view_count)}
              </span>
            </div>

            {/* Comment Count */}
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="w-[26px] h-[26px] text-ff-cyan" strokeWidth={1.5} />
              <span className="text-white text-[14px]">
                {formatCount(item.comment_count)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

