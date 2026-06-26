'use client';
import { useEffect, useState, useCallback } from 'react';
import { NewsItem } from '@/lib/newsService';
import NewsCard from './NewsCard';

type Category = 'all' | 'ai' | 'logistics' | 'automation';

const CATEGORIES: { key: Category; label: string; icon: string }[] = [
  { key: 'all', label: '전체', icon: '📰' },
  { key: 'ai', label: 'AI', icon: '🤖' },
  { key: 'logistics', label: '물류', icon: '🚚' },
  { key: 'automation', label: '자동화', icon: '⚙️' },
];

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState<Category>('all');
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchNews = useCallback(async (cat: Category, forceRefresh = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== 'all') params.set('category', cat);
      if (forceRefresh) params.set('refresh', 'true');
      const res = await fetch(`/api/news?${params}`);
      const data = await res.json();
      setNews(data.news);
      setUpdatedAt(data.updatedAt);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(category);
    const interval = setInterval(() => fetchNews(category), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [category, fetchNews]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews(category, true);
  };

  const filtered = search
    ? news.filter(
        (n) =>
          n.title.toLowerCase().includes(search.toLowerCase()) ||
          n.summary.toLowerCase().includes(search.toLowerCase())
      )
    : news;

  return (
    <div>
      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="뉴스 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-800 transition-colors"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => { setCategory(c.key); setSearch(''); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              category === c.key
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 border border-slate-700/50'
            }`}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        ))}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 border border-slate-700/50 transition-all disabled:opacity-50"
        >
          <span className={refreshing ? 'animate-spin inline-block' : ''}>🔄</span>
          새로고침
        </button>
      </div>

      {/* Update time */}
      {updatedAt && (
        <p className="text-xs text-slate-500 mb-4">
          마지막 업데이트: {new Date(updatedAt).toLocaleString('ko-KR')} · {filtered.length}개 기사
        </p>
      )}

      {/* News grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-16 mb-3"></div>
              <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700/60 rounded w-full mb-1"></div>
              <div className="h-3 bg-slate-700/60 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-4xl mb-3">📭</p>
          <p>검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
