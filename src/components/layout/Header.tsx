'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapIcon, SuitcaseIcon, SparkleIcon, LandmarkIcon, RestaurantIcon, HotelIcon, FestivalIcon, WeatherIcon } from '@/components/icons/Icons';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <SuitcaseIcon className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-900">트래블</span>
              <span className="text-lg font-bold text-blue-600">플래너</span>
            </div>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem href="/" label="여행 계획" active />
            <NavItem href="#features" label="서비스 소개" />
            <NavItem href="#how" label="이용 방법" />
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm"
            >
              <SparkleIcon className="w-4 h-4" />
              여행 만들기
            </Link>
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="메뉴 열기"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in-down">
          <div className="px-4 py-3 space-y-1">
            <MobileNavItem href="/" label="여행 계획" icon={<MapIcon className="w-5 h-5" />} desc="AI가 추천하는 맞춤 여행 일정" />
            <MobileNavItem href="#features" label="서비스 소개" icon={<LandmarkIcon className="w-5 h-5" />} desc="다양한 여행 정보를 한눈에" />
            <MobileNavItem href="#how" label="이용 방법" icon={<SparkleIcon className="w-5 h-5" />} desc="간단한 3단계로 여행 계획 완성" />
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
        active
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavItem({ href, label, icon, desc }: { href: string; label: string; icon: React.ReactNode; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
    </Link>
  );
}
