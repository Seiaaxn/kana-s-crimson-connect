import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ComicCard } from '@/components/ComicCard';
import { getComicLatest, getComicPopular, getComicAll } from '@/lib/api';
import type { Comic } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

type TabType = 'terbaru' | 'populer' | 'semua';

export default function AllComicPage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'terbaru';
  const [tab, setTab] = useState<TabType>(initialTab);
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(18);

  const fetchData = async (t: TabType) => {
    if (t === 'terbaru') return await getComicLatest();
    if (t === 'populer') return await getComicPopular();
    return await getComicAll();
  };

  useEffect(() => {
    setLoading(true);
    setDisplayCount(18);
    fetchData(tab).then(data => { setComics(data); setLoading(false); });
  }, [tab]);

  const hasMore = displayCount < comics.length;
  const loadMore = useCallback(() => { setDisplayCount(prev => prev + 18); }, []);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore, false);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'terbaru', label: 'Terbaru' },
    { key: 'populer', label: 'Populer' },
    { key: 'semua', label: 'Semua' },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground">Semua Komik</h1>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${tab === t.key ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {comics.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">Tidak ada komik ditemukan</p>
            ) : comics.slice(0, displayCount).map((c, i) => <ComicCard key={`${c.slug || i}-${i}`} comic={c} />)}
          </motion.div>
        )}
        {hasMore && (
          <button onClick={loadMore} className="w-full py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
            Muat Lebih Banyak
          </button>
        )}
        <div ref={sentinelRef} className="h-4" />
      </div>
      <BottomNav />
    </main>
  );
}
