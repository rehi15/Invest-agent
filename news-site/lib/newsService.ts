import Parser from 'rss-parser';
import { summarizeArticle } from './summarize';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: 'logistics' | 'physicalai' | 'modular';
  publishedAt: string;
  imageUrl?: string;
}

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
});

const RSS_FEEDS: { url: string; source: string; category: NewsItem['category']; lang: 'ko' | 'en' }[] = [
  // 자동화 물류 (AMR, 4-Way Shuttle 등)
  { url: 'http://www.irobotnews.com/rss/allArticle.xml', source: '로봇신문', category: 'logistics', lang: 'ko' },
  { url: 'http://www.klnews.co.kr/rss/allArticle.xml', source: '물류신문', category: 'logistics', lang: 'ko' },
  { url: 'https://rss.etnews.com/Section901.xml', source: '전자신문 로봇', category: 'logistics', lang: 'ko' },
  { url: 'https://www.automationworld.com/rss.xml', source: 'Automation World', category: 'logistics', lang: 'en' },
  { url: 'https://www.mhlnews.com/rss/all', source: 'MH&L News', category: 'logistics', lang: 'en' },
  // 피지컬 AI (휴머노이드, embodied AI)
  { url: 'http://www.irobotnews.com/rss/allArticle.xml', source: '로봇신문(AI)', category: 'physicalai', lang: 'ko' },
  { url: 'https://rss.etnews.com/Section901.xml', source: '전자신문 AI로봇', category: 'physicalai', lang: 'ko' },
  { url: 'https://techcrunch.com/tag/robotics/feed/', source: 'TechCrunch 로보틱스', category: 'physicalai', lang: 'en' },
  { url: 'https://feeds.feedburner.com/IEEESpectrumRobotics', source: 'IEEE Spectrum', category: 'physicalai', lang: 'en' },
  // 모듈러 설비 / 건축
  { url: 'http://www.cnews.co.kr/rss/allArticle.xml', source: '건설경제신문', category: 'modular', lang: 'ko' },
  { url: 'https://www.constructiondive.com/feeds/news/', source: 'Construction Dive', category: 'modular', lang: 'en' },
];

const KEYWORDS: Record<NewsItem['category'], string[]> = {
  logistics: ['amr', '4-way', '4way', '셔틀', 'shuttle', '물류', '자동화', '창고', '피킹', 'asrs', 'as/rs', '무인운반', 'agv', 'sorter', '소터'],
  physicalai: ['피지컬 ai', 'physical ai', '휴머노이드', 'humanoid', '로봇', 'robot', 'embodied', '보스턴 다이내믹스', 'figure', 'unitree'],
  modular: ['모듈러', 'modular', '건축', '건설', 'osc', '데이터센터', 'construction', 'prefab'],
};

function isRelevant(title: string, summary: string, category: NewsItem['category']): boolean {
  const t = (title + ' ' + summary).toLowerCase();
  return KEYWORDS[category].some((kw) => t.includes(kw));
}

function extractImage(item: Record<string, unknown>): string | undefined {
  const mediaContent = item['media:content'] as Record<string, unknown> | undefined;
  const mediaThumbnail = item['media:thumbnail'] as Record<string, unknown> | undefined;
  const enclosure = item['enclosure'] as Record<string, unknown> | undefined;

  if (mediaContent?.$ && typeof (mediaContent.$ as Record<string, unknown>).url === 'string') {
    return (mediaContent.$ as Record<string, unknown>).url as string;
  }
  if (mediaThumbnail?.$ && typeof (mediaThumbnail.$ as Record<string, unknown>).url === 'string') {
    return (mediaThumbnail.$ as Record<string, unknown>).url as string;
  }
  if (enclosure?.url && typeof enclosure.url === 'string') {
    return enclosure.url;
  }
  return undefined;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

export async function fetchNewsFromRSS(): Promise<NewsItem[]> {
  const results: NewsItem[] = [];

  await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const items = (parsed.items || []).slice(0, 10).map((item, idx) => ({
          id: `${feed.source}-${idx}-${Date.now()}`,
          title: item.title || '',
          summary: stripHtml(item.contentSnippet || item.summary || item.content || '').slice(0, 500),
          url: item.link || '',
          source: feed.source,
          category: feed.category,
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          imageUrl: extractImage(item as unknown as Record<string, unknown>),
        }));
        results.push(...items.filter((n) => isRelevant(n.title, n.summary, feed.category)));
      } catch {
        // feed unavailable, skip silently
      }
    })
  );

  const deduped = Array.from(new Map(results.map((n) => [n.title.slice(0, 30), n])).values());

  // 본문을 가져와서 Claude로 실제 요약 생성 (실패 시 RSS 발췌로 폴백)
  const summarized = await Promise.all(
    deduped.map(async (n) => {
      try {
        const summary = await summarizeArticle(n.title, n.url, n.summary);
        return { ...n, summary };
      } catch {
        return n;
      }
    })
  );

  return summarized.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getMockNews(): NewsItem[] {
  return [
    {
      id: 'mock-1',
      title: '현대차, AMR 기반 스마트 물류센터 본격 가동',
      summary: '현대자동차가 자율이동로봇(AMR) 200대를 투입한 스마트 물류센터를 울산에 개설했습니다. 4-Way 셔틀 시스템과 연계해 입출고 처리 속도를 기존 대비 3배 향상시켰습니다.',
      url: '#',
      source: '로봇신문',
      category: 'logistics',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      title: '보스턴 다이내믹스 아틀라스, 국내 공장 투입 시작',
      summary: '현대차그룹이 보스턴 다이내믹스의 전동 휴머노이드 로봇 아틀라스를 국내 조립 공장에 시범 투입했습니다. 피지컬 AI 기술로 비정형 작업을 처리합니다.',
      url: '#',
      source: '로봇신문',
      category: 'physicalai',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'mock-3',
      title: '국내 모듈러 건축 시장 2024년 1조원 돌파',
      summary: '한국건설산업연구원은 국내 모듈러 건축 시장이 올해 처음으로 1조원을 넘을 것으로 전망했습니다. 공사 기간을 최대 40% 단축하는 효과가 있습니다.',
      url: '#',
      source: '건설경제신문',
      category: 'modular',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];
}
