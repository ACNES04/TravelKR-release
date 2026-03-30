'use client';

import type { AttractionItem } from '@/types/tourapi';
import { PinIcon, PhoneIcon } from '@/components/icons/Icons';

interface AttractionCardProps {
  item: AttractionItem;
  onClick?: (item: AttractionItem) => void;
}

export default function AttractionCard({ item, onClick }: AttractionCardProps) {
  return (
    <button
      onClick={() => onClick?.(item)}
      className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 text-left group"
    >
      <div className="relative h-36 bg-gray-100 overflow-hidden">
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
      </div>
    </button>
  );
}
