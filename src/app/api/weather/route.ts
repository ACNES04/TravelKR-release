// 날씨 API 프록시
import { NextRequest, NextResponse } from 'next/server';
import { getWeatherForPeriod } from '@/lib/api/weather';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const areaCode = searchParams.get('areaCode') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '시작일(startDate)과 종료일(endDate)이 필요합니다.' },
        { status: 400 }
      );
    }

    if (lat === 0 && lng === 0) {
      return NextResponse.json(
        { error: '위도(lat)와 경도(lng)가 필요합니다.' },
        { status: 400 }
      );
    }

    const weather = await getWeatherForPeriod(lat, lng, areaCode, startDate, endDate);
    return NextResponse.json({ weather });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: '날씨 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
