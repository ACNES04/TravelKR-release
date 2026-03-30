'use client';

import { useState, useEffect, useRef } from 'react';
import { MapIcon } from '@/components/icons/Icons';

interface SearchResult {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  id: string;
}

interface SearchFormProps {
  onSelect: (place: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }) => void;
  value: string;
  onChange: (value: string) => void;
}

export default function SearchForm({ onSelect, value, onChange }: SearchFormProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!value || value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.documents || []);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="search-destination" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <MapIcon className="w-4 h-4" /> 여행지 검색
      </label>
      <div className="relative">
        <input
          id="search-destination"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="제주도, 부산, 강릉..."
          className="w-full px-4 py-3 pl-11 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all text-base"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-results"
          role="combobox"
        />
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="search-results"
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto animate-fade-in-up"
          style={{ animationDuration: '0.25s' }}
        >
          {results.map((result) => (
            <li
              key={result.id}
              role="option"
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
              onClick={() => {
                onSelect({
                  name: result.place_name,
                  address: result.road_address_name || result.address_name,
                  lat: parseFloat(result.y),
                  lng: parseFloat(result.x),
                });
                onChange(result.place_name);
                setIsOpen(false);
              }}
            >
              <div className="font-medium text-gray-900 text-sm">{result.place_name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {result.road_address_name || result.address_name}
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && results.length === 0 && !loading && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}
