'use client';

import { useState } from 'react';
import type { PlaceMarker } from '@/types';
import type { AuthUser } from '@/types/auth';
import type { AttractionFeedbackComment } from '@/lib/feedbackStorage';
import { CATEGORY_LABELS } from '@/types';
import { CloseIcon, PinIcon, PhoneIcon } from '@/components/icons/Icons';

interface InfoWindowProps {
  place: PlaceMarker | null;
  onClose: () => void;
  onViewDetail?: (contentId: string) => void;
  likes?: number;
  liked?: boolean;
  comments?: AttractionFeedbackComment[];
  user: AuthUser | null;
  onToggleLike?: () => void;
  onAddComment?: (message: string) => void;
}

export default function InfoWindow({ place, onClose, onViewDetail, likes = 0, liked = false, comments = [], user, onToggleLike, onAddComment }: InfoWindowProps) {
  const [commentText, setCommentText] = useState('');

  if (!place) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full md:w-[420px] md:rounded-2xl rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-in-bottom md:animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* 이미지 */}
        {place.image && (
          <div className="relative h-52 md:h-60 overflow-hidden">
            <img
              src={place.image}
              alt={place.title}
              className="w-full h-full object-cover md:rounded-t-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm"
              aria-label="닫기"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5">
          {!place.image && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="닫기"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 카테고리 배지 */}
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-2">
            {CATEGORY_LABELS[place.category]}
          </span>

          {/* 제목 */}
          <h3 className="text-xl font-bold text-gray-900 mb-3">{place.title}</h3>

          {/* 주소 */}
          {place.address && (
            <div className="flex items-start gap-2 mb-2">
              <PinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{place.address}</span>
            </div>
          )}

          {/* 전화번호 */}
          {place.tel && (
            <div className="flex items-center gap-2 mb-2">
              <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${place.tel}`} className="text-sm text-blue-600 hover:underline">
                {place.tel}
              </a>
            </div>
          )}

          {/* 설명 */}
          {place.overview && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed line-clamp-4">
              {place.overview.replace(/<[^>]*>/g, '')}
            </p>
          )}

          {/* 좋아요/댓글 */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (!user) return;
                  onToggleLike?.();
                }}
                className={`inline-flex items-center gap-2 rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  user
                    ? liked
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {liked ? '좋아요 취소' : '좋아요'}
                <span className="inline-flex h-6 min-w-[34px] items-center justify-center rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  {likes}
                </span>
              </button>
              <div className="text-sm text-gray-500">
                댓글 {comments.length}개
              </div>
            </div>

            {user ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!commentText.trim()) return;
                  onAddComment?.(commentText.trim());
                  setCommentText('');
                }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">댓글 남기기</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="여행 계획에 도움이 되는 한 줄을 남겨보세요."
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    등록하기
                  </button>
                </div>
              </form>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                로그인을 하면 좋아요와 댓글을 작성할 수 있습니다.
              </div>
            )}

            {comments.length > 0 && (
              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-white p-3 border border-gray-100">
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                      <span>{comment.author}</span>
                      <span>{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{comment.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-2 mt-4">
            {place.category === 'stay' && (
              <a
                href={`https://search.naver.com/search.naver?query=${encodeURIComponent(place.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-lg bg-green-500 text-white text-sm font-medium text-center hover:bg-green-600 transition-colors"
              >
                네이버 검색
              </a>
            )}
            <a
              href={`https://map.kakao.com/link/search/${encodeURIComponent(place.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg bg-yellow-400 text-gray-900 text-sm font-medium text-center hover:bg-yellow-500 transition-colors"
            >
              카카오맵에서 보기
            </a>
            {onViewDetail && (
              <button
                onClick={() => onViewDetail(place.id)}
                className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                상세정보
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
