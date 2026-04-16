import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AnimeCard } from '@/components/AnimeCard';
import { getGenreAnime } from '@/lib/api';
import type { Anime } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function GenreAnimePage() {
  const { genreId } = useParams<{ genreId: string }>();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadData = async (p: number) => {
    setLoading(true);
    const data = await getGenreAnime(genreId!, p);
    if (p === 1) setAnimeList(data.animeList);
    else setAnimeList(prev => [...prev, ...data.animeList]);
    setHasMore(data.pagination?.hasNextPage || false);
    setLoading(false);
  };

  useEffect(() => { if (genreId) loadData(1); }, [genreId]);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground capitalize">Genre: {genreId}</h1>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {animeList.map(a => <AnimeCard key={a.animeId} anime={a} />)}
        </div>
        {loading && <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
        {hasMore && !loading && (
          <button onClick={() => { setPage(p => p + 1); loadData(page + 1); }} className="w-full py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg">Muat Lebih Banyak</button>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
