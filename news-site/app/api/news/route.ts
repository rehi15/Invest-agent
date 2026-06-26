import { NextRequest, NextResponse } from 'next/server';
import { fetchNewsFromRSS, getMockNews, NewsItem } from '@/lib/newsService';

let cache: { data: NewsItem[]; updatedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const refresh = searchParams.get('refresh') === 'true';

  const now = Date.now();
  if (!refresh && cache && now - cache.updatedAt < CACHE_TTL) {
    const data = category ? cache.data.filter((n) => n.category === category) : cache.data;
    return NextResponse.json({ news: data, updatedAt: cache.updatedAt, fromCache: true });
  }

  try {
    const news = await fetchNewsFromRSS();
    if (news.length > 0) {
      cache = { data: news, updatedAt: now };
    } else {
      const mock = getMockNews();
      cache = { data: mock, updatedAt: now };
    }
  } catch {
    if (!cache) {
      cache = { data: getMockNews(), updatedAt: now };
    }
  }

  const data = category ? cache.data.filter((n) => n.category === category) : cache.data;
  return NextResponse.json({ news: data, updatedAt: cache.updatedAt, fromCache: false });
}
