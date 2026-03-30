// Gemini AI 일정 추천 API
import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendation, type GeminiRequest } from '@/lib/api/gemini';

export async function POST(request: NextRequest) {
  try {
    const body: GeminiRequest = await request.json();

    if (!body.destination || !body.startDate || !body.endDate) {
      return NextResponse.json(
        { error: '여행지, 시작일, 종료일 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const stream = await generateRecommendation(body);

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('AI Recommend API error:', error);
    return NextResponse.json(
      { error: 'AI 일정 추천 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
