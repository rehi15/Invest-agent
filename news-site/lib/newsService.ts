import Parser from 'rss-parser';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  category: 'ai' | 'logistics' | 'automation';
  publishedAt: string;
  imageUrl?: string;
}

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
});

const RSS_FEEDS: { url: string; source: string; category: NewsItem['category'] }[] = [
  {
    url: 'https://feeds.feedburner.com/venturebeat/SZYF',
    source: 'VentureBeat AI',
    category: 'ai',
  },
  {
    url: 'https://www.technologyreview.com/feed/',
    source: 'MIT Tech Review',
    category: 'ai',
  },
  {
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    source: 'TechCrunch AI',
    category: 'ai',
  },
  {
    url: 'https://www.supplychaindive.com/feeds/news/',
    source: 'Supply Chain Dive',
    category: 'logistics',
  },
  {
    url: 'https://www.logisticsmgmt.com/rss/news',
    source: 'Logistics Management',
    category: 'logistics',
  },
  {
    url: 'https://www.automationworld.com/rss.xml',
    source: 'Automation World',
    category: 'automation',
  },
];

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
          summary: stripHtml(item.contentSnippet || item.summary || item.content || '').slice(0, 200),
          url: item.link || '',
          source: feed.source,
          category: feed.category,
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          imageUrl: extractImage(item as unknown as Record<string, unknown>),
        }));
        results.push(...items);
      } catch {
        // feed unavailable, skip silently
      }
    })
  );

  return results.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getMockNews(): NewsItem[] {
  return [
    {
      id: 'mock-1',
      title: 'OpenAI, 물류 최적화 AI 모델 출시 — 배송 시간 30% 단축 효과',
      summary: 'OpenAI가 공급망 및 물류 최적화에 특화된 새로운 AI 모델을 공개했습니다. 이 모델은 실시간 교통 데이터와 수요 예측을 결합해 배송 경로를 최적화합니다.',
      url: '#',
      source: 'AI News Korea',
      category: 'ai',
      publishedAt: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      title: '아마존 물류센터, 자율주행 로봇 도입으로 피킹 효율 45% 향상',
      summary: '아마존이 최신 자율주행 로봇을 전국 물류센터에 배치하며 운영 효율성을 크게 높였습니다. AI 기반 경로 계획 알고리즘이 핵심입니다.',
      url: '#',
      source: 'Logistics Tech',
      category: 'logistics',
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'mock-3',
      title: '제조 자동화 시장 2030년까지 연평균 9.8% 성장 전망',
      summary: '글로벌 리서치 기관이 발표한 보고서에 따르면 AI 기반 제조 자동화 시장이 폭발적으로 성장하고 있으며, 특히 한국과 일본 시장이 두드러집니다.',
      url: '#',
      source: 'Automation World',
      category: 'automation',
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'mock-4',
      title: 'Google DeepMind, 창고 자동화를 위한 범용 로봇 AI 공개',
      summary: 'DeepMind의 새 로봇 AI는 다양한 물체를 인식하고 분류하는 데 있어 인간 수준의 정확도를 달성했다고 밝혔습니다.',
      url: '#',
      source: 'MIT Tech Review',
      category: 'ai',
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 'mock-5',
      title: '현대자동차, AI 기반 스마트 물류 플랫폼 "H-Logistics" 론칭',
      summary: '현대자동차그룹이 자체 개발한 AI 물류 플랫폼을 공개하며 부품 조달부터 완성차 배송까지 전 과정을 디지털화한다고 발표했습니다.',
      url: '#',
      source: 'Supply Chain Dive',
      category: 'logistics',
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'mock-6',
      title: '드론 배송 자동화, 규제 완화로 국내 상용화 앞당겨질 전망',
      summary: '국토교통부가 도심 드론 배송 관련 규제를 대폭 완화하면서 CJ대한통운, 우체국 등이 본격적인 서비스 확대를 준비 중입니다.',
      url: '#',
      source: 'Logistics Management',
      category: 'automation',
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ];
}
