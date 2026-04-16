import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { getHistory, clearHistory } from '@/lib/storage';
import type { WatchHistory } from '@/lib/types';
import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<WatchHistory[]>(() => getHistory());
  const [tab, setTab] = useState<'all' | 'anime' | 'donghua' | 'comic'>('all');

  const filtered = tab === 'all' ? history : history.filter(h => h.type === tab);

  const handleClear = () => {
    if (confirm('Hapus semua riwayat?')) { clearHistory(); setHistory([]); }
  };

  const getHref = (h: WatchHistory) => {
    if (h.type === 'anime' && h.episodeId) return `/watch/${h.episodeId}`;
    if (h.type === 'donghua' && h.episodeId) return `/donghua-watch/${h.episodeId}`;
    if (h.type === 'comic' && h.chapterSlug) return `/read/${h.chapterSlug}`;
    return '/';
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-foreground">Riwayat</h1>
          {history.length > 0 && <button onClick={handleClear} className="text-xs text-destructive font-medium">Hapus Semua</button>}
        </div>
        <div className="flex gap-2">
          {(['all', 'anime', 'donghua', 'comic'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition capitalize ${tab === t ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t === 'all' ? 'Semua' : t}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada riwayat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(h => (
              <Link key={h.id} to={getHref(h)} className="flex gap-3 p-3 bg-card rounded-lg hover:bg-card/80 transition">
                <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {h.poster ? (
                    <img 
                      src={h.poster} 
                      alt={h.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-lg font-bold text-primary">{h.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{h.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.episodeTitle || h.chapterTitle || ''}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded capitalize">{h.type}</span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(h.watchedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
