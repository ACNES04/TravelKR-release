// 장소 상세정보 API 프록시
import { NextRequest, NextResponse } from 'next/server';
import { getDetailCommon, getDetailImages } from '@/lib/api/tourapi';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json({ error: '장소 ID(contentId)가 필요합니다.' }, { status: 400 });
    }

    const [detail, images] = await Promise.all([
      getDetailCommon(contentId),
      getDetailImages(contentId),
    ]);

    return NextResponse.json({ detail, images });
  } catch (error) {
    console.error('Detail API error:', error);
    return NextResponse.json(
      { error: '장소 상세정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
