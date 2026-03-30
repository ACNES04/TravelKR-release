'use client';

import { useState, useRef, useEffect } from 'react';
import { RobotIcon, SparkleIcon, CalendarIcon } from '@/components/icons/Icons';

interface AIRecommendationProps {
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  styles: string[];
  stays: { title: string; address: string }[];
  attractions: { title: string; address: string; category: string }[];
  foods: { title: string; address: string }[];
  weather: { date: string; skyLabel: string; tempMin: number | null; tempMax: number | null; pop: number }[];
}

export default function AIRecommendation({
  destination,
  startDate,
  endDate,
  adults,
  children,
  styles,
  stays,
  attractions,
  foods,
  weather,
}: AIRecommendationProps) {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  async function generateRecommendation() {
    setLoading(true);
    setError(null);
    setRecommendation('');

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          adults,
          children,
          styles,
          stays,
          attractions,
          foods,
          weather,
        }),
      });

      if (!res.ok) throw new Error('AI 추천을 생성할 수 없습니다.');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('스트리밍을 지원하지 않습니다.');

      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setRecommendation(text);

        // 스크롤 자동 이동
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 추천 생성 실패');
    } finally {
      setLoading(false);
    }
  }

  // 줄바꿈을 HTML로 변환
  const formattedText = recommendation
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('📅') || /^\d+일차/.test(line)) {
        return `<div class="mt-6 mb-3 pb-2 border-b-2 border-blue-200 flex items-center gap-2"><svg class="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span class="text-lg font-bold text-blue-700">${line.replace(/^📅\s*/, '')}</span></div>`;
      }
      if (/^\d{2}:\d{2}/.test(line)) {
        return `<div class="font-semibold text-gray-900 mt-3">${line}</div>`;
      }
      if (line.trim().startsWith('→')) {
        return `<div class="text-sm text-gray-600 ml-6">${line}</div>`;
      }
      return `<div class="text-sm text-gray-700">${line}</div>`;
    })
    .join('');

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500"><RobotIcon className="w-4 h-4" /></div>
          AI 추천 일정
        </h3>
        <button
          onClick={generateRecommendation}
          disabled={loading}
          className={`
            px-4 py-2.5 rounded-full text-sm font-semibold transition-all
            ${
              loading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md hover:shadow-lg'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              생성 중...
            </span>
          ) : recommendation ? (
            '다시 추천받기'
          ) : (
            <span className="flex items-center gap-1.5"><SparkleIcon className="w-4 h-4" /> AI 일정 추천받기</span>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-red-600 text-sm mb-2">{error}</p>
          <button
            onClick={generateRecommendation}
            className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
          >
            다시 시도
          </button>
        </div>
      )}

      {!recommendation && !loading && !error && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-8 text-center">
          <div className="text-4xl mb-3 flex justify-center"><RobotIcon className="w-12 h-12 text-purple-400" /></div>
          <p className="text-gray-600 text-sm mb-1">
            수집된 숙박·관광지·맛집·날씨 데이터를 기반으로
          </p>
          <p className="text-gray-600 text-sm">
            <strong>Gemini AI</strong>가 최적의 여행 일정을 추천해드립니다
          </p>
        </div>
      )}

      {(recommendation || loading) && (
        <div
          ref={contentRef}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 max-h-[600px] overflow-y-auto"
        >
          <div
            dangerouslySetInnerHTML={{ __html: formattedText }}
            className="prose prose-sm max-w-none"
          />
          {loading && (
            <div className="flex items-center gap-2 mt-4 text-gray-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
