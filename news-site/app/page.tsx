import NewsFeed from '@/components/NewsFeed';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-sm">
              🤖
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 leading-none">AI & 물류 자동화</h1>
              <p className="text-xs text-slate-500 mt-0.5">실시간 뉴스 피드</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs text-slate-400">자동 업데이트</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-800/40 to-transparent border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
            AI · 물류 · 자동화 최신 소식
          </h2>
          <p className="text-slate-400 text-sm">
            인공지능, 공급망, 물류 자동화 분야의 글로벌 뉴스를 30분마다 자동으로 수집합니다
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsFeed />
      </main>

      <footer className="border-t border-slate-800/80 mt-16 py-6 text-center text-xs text-slate-600">
        AI & 물류 자동화 뉴스 · 뉴스는 외부 RSS 피드에서 자동 수집됩니다
      </footer>
    </div>
  );
}
