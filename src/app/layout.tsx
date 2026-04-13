import type { Metadata } from "next";
import Script from 'next/script';
import "./globals.css";
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: "국내 여행 플래너 | AI 추천 여행 일정",
  description: "여행지와 날짜를 선택하면 숙박시설, 관광지, 맛집, 날씨, 최적 루트를 한눈에 보여주는 AI 여행 플래너",
  keywords: ["국내여행", "여행플래너", "AI여행", "여행일정", "관광지", "숙박", "맛집"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-white text-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services&autoload=false`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
