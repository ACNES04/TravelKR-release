// 경로 탐색 (Kakao Mobility) API 프록시
import { NextRequest, NextResponse } from 'next/server';
import { getDirections } from '@/lib/api/kakao';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originX = parseFloat(searchParams.get('originX') || '0');
    const originY = parseFloat(searchParams.get('originY') || '0');
    const destX = parseFloat(searchParams.get('destX') || '0');
    const destY = parseFloat(searchParams.get('destY') || '0');
    const waypointsStr = searchParams.get('waypoints') || '';

    if (originX === 0 || originY === 0 || destX === 0 || destY === 0) {
      return NextResponse.json(
        { error: '출발지와 도착지 좌표가 필요합니다.' },
        { status: 400 }
      );
    }

    const waypoints = waypointsStr
      ? waypointsStr.split('|').map((w) => {
          const [x, y] = w.split(',').map(Number);
          return { x, y };
        })
      : undefined;

    const directions = await getDirections(
      { x: originX, y: originY },
      { x: destX, y: destY },
      waypoints
    );

    return NextResponse.json(directions);
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: '경로 탐색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
