'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { getSavedPlans } from '@/lib/planStorage';
import type { SavedPlan } from '@/types';

export default function AuthLandingPage() {
  const { user, logout } = useAuth();
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedPlans([]);
      return;
    }
    setSavedPlans(getSavedPlans(user.email));
  }, [user]);

  return (
    <div className="min-h-screen bg-blue-50 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-3xl p-10 sm:p-12">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.2em]">계정</p>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">로그인 또는 회원가입</h1>
            <p className="mt-3 text-gray-600">여행 계획, AI 추천, 저장된 일정 정보를 한 곳에서 관리하세요.</p>
          </div>

          {user ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 text-center">
                <p className="text-lg font-semibold text-gray-900">안녕하세요, {user.name}님</p>
                <p className="mt-2 text-sm text-gray-600">현재 로그인 상태입니다.</p>
                <button
                  type="button"
                  onClick={logout}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition"
                >
                  로그아웃
                </button>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">저장된 여행 계획</h2>
                    <p className="text-sm text-gray-500">로그인한 계정으로 저장한 일정을 확인하세요.</p>
                  </div>
                </div>
                {savedPlans.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                    저장된 여행 계획이 아직 없습니다.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {savedPlans.map((plan) => (
                      <Link
                        key={plan.id}
                        href={`/plan/${plan.id}?destination=${encodeURIComponent(plan.destination)}&areaCode=${plan.areaCode}&lat=${plan.lat}&lng=${plan.lng}&startDate=${plan.startDate}&endDate=${plan.endDate}&adults=${plan.adults}&children=${plan.children}&styles=${plan.styles.join(',')}`}
                        className="block rounded-3xl border border-gray-100 bg-gray-50 p-4 hover:border-blue-200 hover:bg-blue-50 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{plan.destination}</p>
                            <p className="text-xs text-gray-500">{plan.startDate} ~ {plan.endDate} · 성인 {plan.adults}명{plan.children > 0 ? `, 아동 ${plan.children}명` : ''}</p>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(plan.savedAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/auth/login"
                className="rounded-3xl border border-blue-200 bg-blue-600 px-6 py-5 text-center text-white font-semibold shadow-sm hover:bg-blue-700 transition"
              >
                로그인
              </Link>
              <Link
                href="/auth/register"
                className="rounded-3xl border border-blue-200 bg-white px-6 py-5 text-center text-blue-700 font-semibold shadow-sm hover:bg-blue-50 transition"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
