import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DonghuaCard } from '@/components/DonghuaCard';
import { getDonghuaLatest, getDonghuaPopular, getDonghuaMovie } from '@/lib/api';
import type { DonghuaItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function AllDonghuaPage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'latest' | 'popular' | 'movie') || 'latest';
  const [tab, setTab] = useState<'latest' | 'popular' | 'movie'>(initialTab);
  const [items, setItems] = useState<DonghuaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(18);
  const hasMore = displayCount < items.length;

  useEffect(() => {
    setLoading(true);
    setDisplayCount(18);
    const fetcher = tab === 'latest' ? getDonghuaLatest() : tab === 'popular' ? getDonghuaPopular() : getDonghuaMovie();
    fetcher.then(d => { setItems(d); setLoading(false); });
  }, [tab]);

  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 18);
  }, []);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, false);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground">Semua Donghua</h1>
        <div className="flex gap-2">
          {([{ key: 'latest', label: 'Terbaru' }, { key: 'popular', label: 'Populer' }, { key: 'movie', label: 'Movie' }] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === t.key ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.slice(0, displayCount).map((d, i) => <DonghuaCard key={i} item={d} />)}
          </motion.div>
        )}
        {hasMore && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        <div ref={sentinelRef} className="h-4" />
      </div>
      <BottomNav />
    </main>
  );
}
