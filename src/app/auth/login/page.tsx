'use client';

import { FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '로그인이 실패했습니다.');
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 py-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-blue-100 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-[0.2em]">로그인</p>
            <h1 className="mt-3 text-3xl font-extrabold text-gray-900">계정에 로그인하세요</h1>
            <p className="mt-3 text-sm text-gray-500">여행 계획과 추천을 저장하려면 먼저 로그인해주세요.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">이메일</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="example@travelkr.com"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-gray-700">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </label>
            {(formError || error) && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError || error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700">
              회원가입하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
