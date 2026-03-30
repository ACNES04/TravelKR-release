'use client';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorFallback({
  message = '데이터를 불러오는 중 오류가 발생했습니다.',
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-100">
      <svg
        className="w-12 h-12 text-red-400 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <p className="text-red-600 text-sm text-center mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
