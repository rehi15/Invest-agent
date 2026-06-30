'use client';
import { NewsItem } from '@/lib/newsService';

const categoryLabel: Record<string, { label: string; color: string }> = {
  logistics: { label: '자동화 물류', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  physicalai: { label: '피지컬 AI', color: 'bg-violet-500/20 text-violet-300 border border-violet-500/30' },
  modular: { label: '모듈러·건축', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const cat = categoryLabel[item.category];
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 hover:border-slate-500/50 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${cat.color}`}>
          {cat.label}
        </span>
        <span className="text-xs text-slate-500">{timeAgo(item.publishedAt)}</span>
      </div>
      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white leading-snug mb-2 line-clamp-3">
        {item.title}
      </h3>
      {item.summary && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">{item.summary}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 inline-block"></span>
        {item.source}
      </div>
    </a>
  );
}
