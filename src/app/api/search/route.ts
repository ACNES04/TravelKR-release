// Kakao 장소 검색 API 프록시
import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/api/kakao';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const x = searchParams.get('x') ? parseFloat(searchParams.get('x')!) : undefined;
    const y = searchParams.get('y') ? parseFloat(searchParams.get('y')!) : undefined;
    const radius = searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');

    if (!query) {
      return NextResponse.json({ error: '검색어(query)가 필요합니다.' }, { status: 400 });
    }

    const result = await searchPlaces(query, x, y, radius, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '장소 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
