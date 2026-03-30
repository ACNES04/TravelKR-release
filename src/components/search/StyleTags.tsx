'use client';

import type { TravelStyle } from '@/types';
import { NatureIcon, LandmarkIcon, RestaurantIcon, ActivityIcon, HealingIcon, TheaterIcon, ShoppingIcon, FestivalIcon, TargetIcon } from '@/components/icons/Icons';

const STYLE_ICONS: Record<TravelStyle, React.ReactNode> = {
  자연: <NatureIcon className="w-4 h-4" />,
  역사: <LandmarkIcon className="w-4 h-4" />,
  맛집: <RestaurantIcon className="w-4 h-4" />,
  액티비티: <ActivityIcon className="w-4 h-4" />,
  힐링: <HealingIcon className="w-4 h-4" />,
  문화: <TheaterIcon className="w-4 h-4" />,
  쇼핑: <ShoppingIcon className="w-4 h-4" />,
  축제: <FestivalIcon className="w-4 h-4" />,
};

const ALL_STYLES: TravelStyle[] = ['자연', '역사', '맛집', '액티비티', '힐링', '문화', '쇼핑', '축제'];

interface StyleTagsProps {
  selected: TravelStyle[];
  onChange: (styles: TravelStyle[]) => void;
}

export default function StyleTags({ selected, onChange }: StyleTagsProps) {
  function toggleStyle(style: TravelStyle) {
    if (selected.includes(style)) {
      onChange(selected.filter((s) => s !== style));
    } else {
      onChange([...selected, style]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><TargetIcon className="w-4 h-4" /> 여행 스타일</label>
      <div className="flex flex-wrap gap-2">
        {ALL_STYLES.map((style) => {
          const isSelected = selected.includes(style);
          return (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold
                transition-all border
                ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              aria-pressed={isSelected}
            >
              <span>{STYLE_ICONS[style]}</span>
              <span>{style}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
