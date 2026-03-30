// Google Gemini AI 클라이언트

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `당신은 전문 국내 여행 플래너입니다.
아래 제공되는 숙박시설, 관광지, 맛집, 날씨 데이터를 분석하여
최적의 일차별 여행 일정을 만들어주세요.

규칙:
1. 날씨가 나쁜 날(강수확률 60% 이상)은 실내 관광지/문화시설을 우선 배치
2. 동선을 최소화하여 가까운 장소끼리 묶기
3. 식사 시간(12시, 18시)에 맞춰 맛집 포함
4. 각 장소의 예상 소요 시간 포함
5. 숙소 체크인(15시)/체크아웃(11시) 시간 고려
6. 한국어로 응답

출력 형식:
N일차 (M월 D일, 날씨상태 기온)
HH:MM - 장소명 (카테고리)
        → 간단한 설명
        → 다음 장소까지 이동시간: 약 N분`;

export interface GeminiRequest {
  destination: string;
  startDate: string;
  endDate: string;
  adults: number;
  children: number;
  styles: string[];
  stays: { title: string; address: string }[];
  attractions: { title: string; address: string; category: string }[];
  foods: { title: string; address: string }[];
  weather: { date: string; skyLabel: string; tempMin: number | null; tempMax: number | null; pop: number }[];
}

function buildPrompt(data: GeminiRequest): string {
  const weatherInfo = data.weather
    .map((w) => `- ${w.date}: ${w.skyLabel}, ${w.tempMin ?? '?'}°C~${w.tempMax ?? '?'}°C, 강수확률 ${w.pop}%`)
    .join('\n');

  const stayInfo = data.stays
    .map((s) => `- ${s.title} (${s.address})`)
    .join('\n');

  const attractionInfo = data.attractions
    .map((a) => `- ${a.title} (${a.category}, ${a.address})`)
    .join('\n');

  const foodInfo = data.foods
    .map((f) => `- ${f.title} (${f.address})`)
    .join('\n');

  return `${SYSTEM_PROMPT}

---
여행 정보:
- 여행지: ${data.destination}
- 일정: ${data.startDate} ~ ${data.endDate}
- 인원: 성인 ${data.adults}명${data.children > 0 ? `, 아동 ${data.children}명` : ''}
- 여행 스타일: ${data.styles.join(', ')}

날씨 정보:
${weatherInfo || '날씨 정보가 없습니다.'}

숙박시설:
${stayInfo || '숙박시설 정보가 없습니다.'}

관광지/문화시설:
${attractionInfo || '관광지 정보가 없습니다.'}

맛집:
${foodInfo || '맛집 정보가 없습니다.'}

위 데이터를 기반으로 최적의 여행 일정을 만들어주세요.`;
}

/** Gemini AI 일정 추천 (스트리밍) */
export async function generateRecommendation(data: GeminiRequest): Promise<ReadableStream<Uint8Array>> {
  const prompt = buildPrompt(data);

  const res = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  // 비스트리밍 응답을 스트리밍으로 변환
  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 추천 결과를 생성할 수 없습니다.';

  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // 청크 단위로 전송
      const chunks = text.match(/.{1,50}/g) || [text];
      let i = 0;
      const interval = setInterval(() => {
        if (i < chunks.length) {
          controller.enqueue(encoder.encode(chunks[i]));
          i++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 30);
    },
  });
}

/** Gemini AI 일정 추천 (전체 텍스트 반환) */
export async function generateRecommendationText(data: GeminiRequest): Promise<string> {
  const prompt = buildPrompt(data);

  const res = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
  }

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || 'AI 추천 결과를 생성할 수 없습니다.';
}
