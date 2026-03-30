// 숙박시설 검색 API 프록시
import { NextRequest, NextResponse } from 'next/server';
import { searchStay } from '@/lib/api/tourapi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get('areaCode');
    const sigunguCode = searchParams.get('sigunguCode') || undefined;
    const pageNo = parseInt(searchParams.get('pageNo') || '1');
    const numOfRows = parseInt(searchParams.get('numOfRows') || '10');

    if (!areaCode) {
      return NextResponse.json({ error: '지역코드(areaCode)가 필요합니다.' }, { status: 400 });
    }

    const stays = await searchStay(areaCode, sigunguCode, pageNo, numOfRows);
    return NextResponse.json({ items: stays });
  } catch (error) {
    console.error('Stay API error:', error);
    return NextResponse.json(
      { error: '숙박시설 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
