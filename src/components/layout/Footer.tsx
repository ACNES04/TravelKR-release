import Link from 'next/link';
import { SuitcaseIcon, MapIcon } from '@/components/icons/Icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <SuitcaseIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold text-white">트래블</span>
                <span className="text-base font-bold text-blue-400">플래너</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              AI 기반 국내 여행 플래너로 숙박, 관광지,<br />
              맛집, 날씨, 최적 경로를 한눈에 확인하세요.
            </p>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">서비스</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">여행 계획 만들기</Link></li>
              <li><span className="text-gray-500">관광지 정보</span></li>
              <li><span className="text-gray-500">날씨 예보</span></li>
              <li><span className="text-gray-500">AI 일정 추천</span></li>
            </ul>
          </div>

          {/* 데이터 출처 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">데이터 출처</h4>
            <ul className="space-y-2.5 text-sm">
              <li>한국관광공사 Tour API</li>
              <li>기상청 날씨 API</li>
              <li>카카오 지도 / 로컬 API</li>
              <li>Google Gemini AI</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">&copy; 2026 트래블플래너. 캡스톤디자인 프로젝트.</p>
          <p className="text-xs">국내 여행 정보 제공 서비스</p>
        </div>
      </div>
    </footer>
  );
}
