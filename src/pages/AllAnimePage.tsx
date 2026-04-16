import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AnimeCard } from '@/components/AnimeCard';
import { getOngoingAnime, getCompletedAnime } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function AllAnimePage() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'ongoing' | 'completed') || 'ongoing';
  const [tab, setTab] = useState<'ongoing' | 'completed'>(initialTab);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadData = async (p: number, type: string) => {
    const data = type === 'ongoing' ? await getOngoingAnime(p) : await getCompletedAnime(p);
    return data;
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    loadData(1, tab).then(data => {
      setAnimeList(data.animeList);
      setHasMore(data.pagination?.hasNextPage || false);
      setLoading(false);
    });
  }, [tab]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    loadData(next, tab).then(data => {
      setAnimeList(prev => [...prev, ...data.animeList]);
      setHasMore(data.pagination?.hasNextPage || false);
      setPage(next);
      setLoadingMore(false);
    });
  }, [tab, page, loadingMore, hasMore]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore, loadingMore);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground">Semua Anime</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('ongoing')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === 'ongoing' ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Ongoing</button>
          <button onClick={() => setTab('completed')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === 'completed' ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Completed</button>
        </div>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {animeList.map(a => <AnimeCard key={a.animeId} anime={a} />)}
          </motion.div>
        )}
        {loadingMore && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        <div ref={sentinelRef} className="h-4" />
      </div>
      <BottomNav />
    </main>
  );
}
