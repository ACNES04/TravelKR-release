'use client';

import type { ContentTypeId } from '@/types/tourapi';
import { LandmarkIcon, RestaurantIcon, FestivalIcon, TheaterIcon } from '@/components/icons/Icons';

interface CategoryTab {
  id: ContentTypeId;
  label: string;
  icon: React.ReactNode;
}

const TABS: CategoryTab[] = [
  { id: '12', label: '관광지', icon: <LandmarkIcon className="w-4 h-4" /> },
  { id: '39', label: '맛집', icon: <RestaurantIcon className="w-4 h-4" /> },
  { id: '15', label: '축제/행사', icon: <FestivalIcon className="w-4 h-4" /> },
  { id: '14', label: '문화시설', icon: <TheaterIcon className="w-4 h-4" /> },
];

interface CategoryTabsProps {
  selected: ContentTypeId;
  onChange: (tab: ContentTypeId) => void;
}

export default function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={selected === tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-sm font-semibold
            transition-all whitespace-nowrap
            ${
              selected === tab.id
                ? 'bg-white text-blue-600 shadow-sm border border-gray-200/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
