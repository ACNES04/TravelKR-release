# 🧳 국내 여행 플래너

사용자가 여행지와 날짜를 선택하면 숙박시설, 관광지, 맛집, 날씨, 최적 루트를 한눈에 보여주는 AI 여행 플래너 웹사이트입니다.

## 기술 스택

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes
- **지도**: Kakao Maps SDK
- **AI**: Google Gemini 2.5 Flash-Lite
- **Database**: PostgreSQL

## 사용 API

| 기능 | API | 비용 |
|------|-----|------|
| 지도 + 마커 | Kakao Maps JavaScript SDK | 무료 (30만회/일) |
| 경로 탐색 | Kakao Mobility 길찾기 API | 무료 |
| 장소 검색 | Kakao Local 검색 API | 무료 |
| 숙박시설 | 한국관광공사 TourAPI | 무료 (1,000회/일) |
| 관광지/맛집/축제 | 한국관광공사 TourAPI | 무료 (1,000회/일) |
| 단기 날씨 (3일) | 기상청 단기예보 API | 무료 |
| 중기 날씨 (10일) | 기상청 중기예보 API | 무료 |
| AI 일정 추천 | Google Gemini 2.5 Flash-Lite | 무료 (1,500회/일) |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 열어 API 키를 입력하세요:

```env
TOUR_API_KEY=your_tour_api_key
WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_KAKAO_MAP_KEY=your_kakao_js_key
KAKAO_REST_API_KEY=your_kakao_rest_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/travel_planner
```

**API 키 발급처:**
- 한국관광공사 TourAPI / 기상청 API → [공공데이터포털](https://www.data.go.kr)
- Kakao Maps / Local / Mobility → [Kakao Developers](https://developers.kakao.com)
- Google Gemini → [Google AI Studio](https://aistudio.google.com)

### 3. PostgreSQL 설정 (선택)

```bash
createdb travel_planner
```

> DB 없이도 기본 기능(검색, 지도, AI 추천)은 모두 사용 가능합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인하세요.

## 주요 기능

### 메인 페이지 (`/`)
- 여행지 검색 (Kakao Local 자동완성)
- 날짜 범위 선택 (달력 UI)
- 인원 수 설정 (성인/아동)
- 여행 스타일 태그 선택

### 결과 대시보드 (`/plan/[id]`)
- **🗺️ 지도**: 카테고리별 색상 마커, 최적 루트 폴리라인
- **🌤️ 날씨**: 단기(3일)/중기(10일) 날씨 예보 카드
- **🏨 숙박**: TourAPI 숙박시설 리스트 + 외부 예약 링크
- **🏛️ 관광지/맛집**: 카테고리 탭 전환 (관광지/맛집/축제/문화시설)
- **🤖 AI 추천**: Gemini AI 기반 일차별 최적 일정 생성

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 검색 페이지
│   ├── plan/[id]/page.tsx    # 결과 대시보드
│   ├── api/                  # API 프록시 라우트
│   └── layout.tsx
├── components/               # UI 컴포넌트
│   ├── search/               # 검색 폼, 날짜선택, 스타일태그
│   ├── map/                  # 카카오맵, 마커, 경로
│   ├── weather/              # 날씨 패널
│   ├── stay/                 # 숙박 리스트/카드
│   ├── attraction/           # 관광지 리스트/카드/카테고리탭
│   ├── ai/                   # AI 추천 패널
│   └── common/               # 스켈레톤, 에러 폴백
├── lib/
│   ├── api/                  # API 클라이언트 (TourAPI, 기상청, Kakao, Gemini)
│   ├── utils/                # 유틸리티 (격자좌표변환, 지역코드, 날짜포맷)
│   ├── cache.ts              # 인메모리 캐시 (TTL 1시간)
│   └── db.ts                 # PostgreSQL 연결
└── types/                    # TypeScript 타입 정의
```

## 반응형 디자인

- **데스크톱**: 좌측 지도 50% + 우측 패널 50% 분할
- **모바일**: 상단 지도 + 하단 탭 네비게이션 패널
