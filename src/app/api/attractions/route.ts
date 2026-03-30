// 관광지/맛집/축제 검색 API 프록시
import { NextRequest, NextResponse } from 'next/server';
import { searchByArea } from '@/lib/api/tourapi';
import type { ContentTypeId } from '@/types/tourapi';

const VALID_CONTENT_TYPES = ['12', '14', '15', '25', '28', '32', '38', '39'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const areaCode = searchParams.get('areaCode');
    const contentTypeId = searchParams.get('contentTypeId');
    const sigunguCode = searchParams.get('sigunguCode') || undefined;
    const pageNo = parseInt(searchParams.get('pageNo') || '1');
    const numOfRows = parseInt(searchParams.get('numOfRows') || '20');

    if (!areaCode) {
      return NextResponse.json({ error: '지역코드(areaCode)가 필요합니다.' }, { status: 400 });
    }

    if (!contentTypeId || !VALID_CONTENT_TYPES.includes(contentTypeId)) {
      return NextResponse.json(
        { error: '유효한 관광유형(contentTypeId)이 필요합니다.' },
        { status: 400 }
      );
    }

    const items = await searchByArea(
      areaCode,
      contentTypeId as ContentTypeId,
      sigunguCode,
      pageNo,
      numOfRows
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Attractions API error:', error);
    return NextResponse.json(
      { error: '관광지 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
