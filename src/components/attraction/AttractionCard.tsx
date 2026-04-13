'use client';

import type { AttractionItem } from '@/types/tourapi';
import { PinIcon, PhoneIcon } from '@/components/icons/Icons';

interface AttractionCardProps {
  item: AttractionItem;
  onClick?: (item: AttractionItem) => void;
  selected?: boolean;
  likes?: number;
  commentsCount?: number;
}

export default function AttractionCard({ item, onClick, selected = false, likes = 0, commentsCount = 0 }: AttractionCardProps) {
  return (
    <button
      onClick={() => onClick?.(item)}
      className={`w-full bg-white rounded-2xl border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left group ${
        selected ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {selected && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold shadow-sm">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              선택됨
            </span>
          </div>
        )}
        {item.firstimage ? (
          <img
            src={item.firstimage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
        <p className="text-xs text-gray-500 mt-1.5 truncate flex items-center gap-1">
          <PinIcon className="w-3 h-3 flex-shrink-0 text-gray-400" /> {item.addr1}
        </p>
        {item.tel && (
          <p className="text-xs text-gray-400 mt-1 truncate flex items-center gap-1"><PhoneIcon className="w-3 h-3 flex-shrink-0" /> {item.tel}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>❤️ 좋아요 {likes}</span>
          <span>💬 댓글 {commentsCount}</span>
        </div>
      </div>
    </button>
  );
}
