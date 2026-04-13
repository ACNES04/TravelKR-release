'use client';

import { useState, useRef, useEffect } from 'react';
import { RobotIcon, SparkleIcon, CalendarIcon } from '@/components/icons/Icons';

interface TopLikedAttraction {
  title: string;
  likes: number;
  comments: number;
}

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
  topLikedAttractions?: TopLikedAttraction[];
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
  topLikedAttractions,
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
          topLikedAttractions,
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

  // 인라인 마크다운 처리 (bold, italic, code)
  const inlineMd = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs">$1</code>');

  // 마크다운 텍스트를 HTML로 변환
  const formattedText = (() => {
    const lines = recommendation.split('\n');
    const htmlParts: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // 빈 줄
      if (trimmed === '') {
        htmlParts.push('<div class="h-2"></div>');
        i++;
        continue;
      }

      // 수평선
      if (/^[-=]{3,}$/.test(trimmed)) {
        htmlParts.push('<hr class="my-5 border-gray-200" />');
        i++;
        continue;
      }

      // 마크다운 테이블 감지
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableRows: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableRows.push(lines[i].trim());
          i++;
        }
        if (tableRows.length >= 2) {
          const parseRow = (row: string) =>
            row.split('|').slice(1, -1).map(c => c.trim());
          const headers = parseRow(tableRows[0]);
          // skip separator row (|---|---|...)
          const startIdx = /^[\s|:-]+$/.test(tableRows[1]) ? 2 : 1;
          let tableHtml = '<div class="overflow-x-auto my-4"><table class="w-full text-sm border-collapse">';
          tableHtml += '<thead><tr>';
          for (const h of headers) {
            tableHtml += `<th class="bg-blue-50 text-blue-700 font-semibold text-xs px-3 py-2 text-left border-b-2 border-blue-200">${inlineMd(h)}</th>`;
          }
          tableHtml += '</tr></thead><tbody>';
          for (let r = startIdx; r < tableRows.length; r++) {
            const cells = parseRow(tableRows[r]);
            const bg = (r - startIdx) % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            tableHtml += `<tr class="${bg}">`;
            for (let c = 0; c < cells.length; c++) {
              const bold = c === 1 ? ' font-medium text-gray-900' : ' text-gray-600';
              tableHtml += `<td class="px-3 py-2 border-b border-gray-100 text-xs${bold}">${inlineMd(cells[c] || '')}</td>`;
            }
            tableHtml += '</tr>';
          }
          tableHtml += '</tbody></table></div>';
          htmlParts.push(tableHtml);
        }
        continue;
      }

      // 일차/섹션 헤더 (## 🗓️ 1일차..., ## 📋 일정 요약, ## 💡 여행 팁 등)
      if (/^#{1,3}\s/.test(trimmed) || /^🗓️/.test(trimmed) || /^\d+일차/.test(trimmed)) {
        const headerText = trimmed.replace(/^#{1,3}\s*/, '').trim();
        // 일차 헤더인지 확인
        const isDayHeader = /\d+일차/.test(headerText) || /🗓️/.test(headerText);
        const isSummary = /📋/.test(headerText);
        const isTip = /💡/.test(headerText);

        let bgClass = 'bg-blue-50 border-blue-200';
        let textClass = 'text-blue-700';
        let iconSvg = '<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

        if (isSummary) {
          bgClass = 'bg-indigo-50 border-indigo-200';
          textClass = 'text-indigo-700';
          iconSvg = '<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>';
        } else if (isTip) {
          bgClass = 'bg-amber-50 border-amber-200';
          textClass = 'text-amber-700';
          iconSvg = '<svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 014 12.7V17a1 1 0 01-1 1H9a1 1 0 01-1-1v-2.3A7 7 0 0112 2z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>';
        }

        htmlParts.push(`<div class="mt-6 mb-3 px-4 py-2.5 rounded-xl ${bgClass} border">
          <div class="flex items-center gap-2 ${textClass}">
            ${iconSvg}
            <span class="text-base font-bold">${inlineMd(headerText)}</span>
          </div>
        </div>`);
        i++;
        continue;
      }

      // 타임라인 항목: * **HH:MM - 장소명 (이모지 유형)**
      const timelineMatch = trimmed.match(/^\*\s+\*\*(\d{1,2}:\d{2})\s*[-–]\s*(.+?)\*\*\s*$/);
      if (timelineMatch) {
        const time = timelineMatch[1];
        const place = timelineMatch[2];
        // 이모지 카테고리 감지
        const emojiMatch = place.match(/(🏠|📸|🍴|☕|🎯|🛍️)/);
        const emoji = emojiMatch ? emojiMatch[1] : '📍';
        const placeText = place.replace(/\(([^)]*)\)\s*$/, '<span class="text-xs font-normal text-gray-500 ml-1">($1)</span>');

        htmlParts.push(`<div class="flex items-start gap-3 mt-4 ml-2 group">
          <div class="flex flex-col items-center flex-shrink-0">
            <span class="inline-flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-lg px-2.5 py-1 min-w-[56px] shadow-sm">${time}</span>
            <div class="w-0.5 h-full bg-blue-200 mt-1 min-h-[8px]"></div>
          </div>
          <div class="flex-1 pb-2">
            <div class="flex items-center gap-1.5">
              <span class="text-lg">${emoji}</span>
              <span class="text-sm font-bold text-gray-900">${inlineMd(placeText)}</span>
            </div>
          </div>
        </div>`);
        i++;
        continue;
      }

      // 시간대 항목 (09:00 - 장소명 — 볼드 아닌 버전)
      const simpleTimeMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*[-–]\s*(.*)/);
      if (simpleTimeMatch) {
        const time = simpleTimeMatch[1];
        const place = simpleTimeMatch[2];
        const emojiMatch = place.match(/(🏠|📸|🍴|☕|🎯|🛍️)/);
        const emoji = emojiMatch ? emojiMatch[1] : '📍';

        htmlParts.push(`<div class="flex items-start gap-3 mt-4 ml-2">
          <div class="flex flex-col items-center flex-shrink-0">
            <span class="inline-flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-lg px-2.5 py-1 min-w-[56px] shadow-sm">${time}</span>
            <div class="w-0.5 h-full bg-blue-200 mt-1 min-h-[8px]"></div>
          </div>
          <div class="flex-1 pb-2">
            <div class="flex items-center gap-1.5">
              <span class="text-lg">${emoji}</span>
              <span class="text-sm font-bold text-gray-900">${inlineMd(place)}</span>
            </div>
          </div>
        </div>`);
        i++;
        continue;
      }

      // 이동 정보 (→ 🚗 이동:, → ⏱️ 소요 시간:)
      if (/^\s*→/.test(line)) {
        const text = trimmed.replace(/^→\s*/, '');
        const isTransport = /🚗|🚌|🚶|🚇|🚕|이동/.test(text);
        const isTime = /⏱️|소요\s*시간/.test(text);

        if (isTransport) {
          htmlParts.push(`<div class="flex items-center gap-2 ml-[76px] mt-1.5 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg w-fit">
            <span class="text-xs text-green-700 font-medium">${inlineMd(text)}</span>
          </div>`);
        } else if (isTime) {
          htmlParts.push(`<div class="flex items-center gap-2 ml-[76px] mt-1 px-3 py-1 bg-orange-50 border border-orange-100 rounded-lg w-fit">
            <span class="text-xs text-orange-700 font-medium">${inlineMd(text)}</span>
          </div>`);
        } else {
          htmlParts.push(`<div class="ml-[76px] mt-1">
            <span class="text-xs text-gray-600 leading-relaxed">${inlineMd(text)}</span>
          </div>`);
        }
        i++;
        continue;
      }

      // 리스트 항목 (- , • , * )
      if (/^\s*[-•]\s/.test(trimmed) || (/^\*\s/.test(trimmed) && !/^\*\s+\*\*/.test(trimmed))) {
        const text = trimmed.replace(/^[-•*]\s*/, '');
        htmlParts.push(`<div class="flex items-start gap-2.5 ml-4 mt-1.5">
          <span class="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
          <span class="text-sm text-gray-700 leading-relaxed">${inlineMd(text)}</span>
        </div>`);
        i++;
        continue;
      }

      // 숫자 리스트
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        htmlParts.push(`<div class="flex items-start gap-2.5 ml-4 mt-1.5">
          <span class="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-semibold rounded-full w-5 h-5 flex-shrink-0 mt-0.5">${numMatch[1]}</span>
          <span class="text-sm text-gray-700 leading-relaxed">${inlineMd(numMatch[2])}</span>
        </div>`);
        i++;
        continue;
      }

      // 일반 텍스트
      htmlParts.push(`<div class="text-sm text-gray-700 leading-relaxed mt-1">${inlineMd(trimmed)}</div>`);
      i++;
    }

    return htmlParts.join('');
  })();

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

      {topLikedAttractions && topLikedAttractions.length > 0 && (
        <div className="mb-4 rounded-3xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-semibold text-blue-700">인기 좋아요 관광지</p>
              <p className="text-xs text-blue-600/80">좋아요가 많은 관광지를 AI 추천에도 참고합니다.</p>
            </div>
            <span className="text-xs text-blue-700 font-semibold">TOP {topLikedAttractions.length}</span>
          </div>
          <div className="space-y-2">
            {topLikedAttractions.map((item, index) => (
              <div key={`${item.title}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 border border-blue-100">
                <div className="text-sm text-gray-900 font-semibold truncate">{item.title}</div>
                <div className="text-xs text-gray-500 min-w-[90px] text-right">
                  좋아요 {item.likes} · 댓글 {item.comments}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-h-[600px] overflow-y-auto"
        >
          <div
            dangerouslySetInnerHTML={{ __html: formattedText }}
            className="max-w-none [&_hr]:my-4"
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
