// 날짜 포맷 유틸리티

/**
 * Date 객체를 YYYYMMDD 형식 문자열로 변환
 */
export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Date 객체를 YYYYMMDDHHMM 형식 문자열로 변환 (중기예보용)
 */
export function formatDateYMDHM(date: Date): string {
  const ymd = formatDateYMD(date);
  // 중기예보는 06시 또는 18시 발표
  const hour = date.getHours() < 18 ? '0600' : '1800';
  return `${ymd}${hour}`;
}

/**
 * YYYYMMDD → M월 D일 (요일) 형식으로 변환
 */
export function formatDateKorean(dateStr: string): string {
  const y = parseInt(dateStr.slice(0, 4));
  const m = parseInt(dateStr.slice(4, 6));
  const d = parseInt(dateStr.slice(6, 8));
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = days[new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${dayOfWeek})`;
}

/**
 * YYYY-MM-DD → M월 D일 형식으로 변환
 */
export function formatDateKoreanISO(dateStr: string): string {
  const parts = dateStr.split('-');
  const m = parseInt(parts[1]);
  const d = parseInt(parts[2]);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = days[new Date(parseInt(parts[0]), m - 1, d).getDay()];
  return `${m}월 ${d}일 (${dayOfWeek})`;
}

/**
 * 두 날짜 사이의 일수 계산
 */
export function getDaysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 오늘로부터 며칠 후인지 계산
 */
export function getDaysFromToday(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 날짜 범위 생성 (시작일부터 종료일까지의 YYYY-MM-DD 배열)
 */
export function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(formatDateISO(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 기상청 단기예보 base_time 계산
 * 단기예보는 02, 05, 08, 11, 14, 17, 20, 23시에 발표
 */
export function getBaseTime(date: Date): string {
  const hour = date.getHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];

  let baseTime = 23; // 전날 23시
  for (const bt of baseTimes) {
    if (hour >= bt + 1) {
      // 발표 후 약 1시간 뒤 조회 가능
      baseTime = bt;
    }
  }

  return String(baseTime).padStart(2, '0') + '00';
}
