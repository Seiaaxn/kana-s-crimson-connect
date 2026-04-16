import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ComicCard } from '@/components/ComicCard';
import { getComicByGenre } from '@/lib/api';
import type { Comic } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function ComicGenrePage() {
  const { genre } = useParams<{ genre: string }>();
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(18);

  useEffect(() => {
    if (!genre) return;
    setLoading(true);
    setDisplayCount(18);
    getComicByGenre(genre).then(d => { setComics(d); setLoading(false); });
  }, [genre]);

  const hasMore = displayCount < comics.length;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground capitalize">Genre: {genre}</h1>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {comics.slice(0, displayCount).map((c, i) => <ComicCard key={i} comic={c} />)}
            </div>
            {hasMore && (
              <button onClick={() => setDisplayCount(prev => prev + 18)} className="w-full py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition">
                Muat Lebih Banyak
              </button>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
