// 기사 원문(또는 RSS 발췌)을 Claude API로 보내 실제 한국어 요약을 생성한다.
// API 키가 없거나 호출에 실패하면 원본 발췌를 그대로 반환한다 (폴백).

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-haiku-4-5-20251001';

async function fetchArticleText(url: string): Promise<string | null> {
  if (!url || url === '#') return null;
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const text = await res.text();
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 6000);
  } catch {
    return null;
  }
}

export async function summarizeArticle(title: string, url: string, fallbackExcerpt: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) return fallbackExcerpt;

  const articleText = (await fetchArticleText(url)) || fallbackExcerpt;
  if (!articleText) return fallbackExcerpt;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `다음은 자동화 물류(AMR/4-Way Shuttle), 피지컬 AI, 모듈러 건축 분야 기사다. 핵심 내용을 한국어로 3~4문장으로 요약하라. 불필요한 수식어 없이 사실 위주로, 출력은 요약문만.\n\n제목: ${title}\n\n본문:\n${articleText}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return fallbackExcerpt;
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    return text || fallbackExcerpt;
  } catch {
    return fallbackExcerpt;
  }
}
