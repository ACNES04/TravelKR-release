'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarIcon } from '@/components/icons/Icons';

interface DatePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function DatePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = startDate ? new Date(startDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function handleDayClick(day: number) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (date < today) return;

    const dateStr = formatDate(date);

    if (selecting === 'start') {
      onStartDateChange(dateStr);
      if (endDate && dateStr > endDate) {
        onEndDateChange('');
      }
      setSelecting('end');
    } else {
      if (dateStr < startDate) {
        onStartDateChange(dateStr);
        onEndDateChange('');
        setSelecting('end');
      } else {
        onEndDateChange(dateStr);
        setSelecting('start');
        setIsOpen(false);
      }
    }
  }

  function isInRange(day: number): boolean {
    if (!startDate || !endDate) return false;
    const date = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    return date >= startDate && date <= endDate;
  }

  function isSelected(day: number): boolean {
    const date = formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    return date === startDate || date === endDate;
  }

  function isPast(day: number): boolean {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < today;
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const displayStartDate = startDate
    ? `${new Date(startDate).getMonth() + 1}월 ${new Date(startDate).getDate()}일`
    : '시작일';
  const displayEndDate = endDate
    ? `${new Date(endDate).getMonth() + 1}월 ${new Date(endDate).getDate()}일`
    : '종료일';

  const dayCount =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> 여행 날짜</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-left hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        aria-label="날짜 선택"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className={startDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {displayStartDate}
            </span>
            <span className="text-gray-300">→</span>
            <span className={endDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
              {displayEndDate}
            </span>
          </div>
          {dayCount > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {dayCount}박 {dayCount + 1}일
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="이전 달"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="font-semibold text-gray-900">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="다음 달"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;

              const past = isPast(day);
              const selected = isSelected(day);
              const inRange = isInRange(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-9 h-9 rounded-lg text-sm font-medium transition-all
                    ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                    ${selected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                    ${inRange && !selected ? 'bg-blue-100 text-blue-700' : ''}
                    ${!selected && !inRange && !past ? 'text-gray-700' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            {selecting === 'start' ? '시작일을 선택하세요' : '종료일을 선택하세요'}
          </div>
        </div>
      )}
    </div>
  );
}
