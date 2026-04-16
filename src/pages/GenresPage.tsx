import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { getGenres, getComicGenres } from '@/lib/api';
import type { Genre, ComicGenre } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const donghuaGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Martial Arts', 'Romance', 'Sci-fi', 'Supernatural'];

export default function GenresPage() {
  const [animeGenres, setAnimeGenres] = useState<Genre[]>([]);
  const [comicGenreList, setComicGenreList] = useState<ComicGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'anime' | 'comic' | 'donghua'>('anime');

  useEffect(() => {
    Promise.all([getGenres(), getComicGenres()]).then(([ag, cg]) => {
      setAnimeGenres(ag);
      setComicGenreList(cg);
      setLoading(false);
    });
  }, []);

  if (loading) return <main className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div><BottomNav /></main>;

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground">Genre</h1>
        <div className="flex gap-2">
          {(['anime', 'comic', 'donghua'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition capitalize ${tab === t ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {tab === 'anime' && animeGenres.map(g => (
            <Link key={g.genreId} to={`/genre/${g.genreId}`} className="p-3 bg-card rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition border border-border">{g.title}</Link>
          ))}
          {tab === 'comic' && comicGenreList.map(g => (
            <Link key={g.value} to={`/comic-genre/${g.value}`} className="p-3 bg-card rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition border border-border">{g.name}</Link>
          ))}
          {tab === 'donghua' && donghuaGenres.map(g => (
            <Link key={g} to={`/donghua-genre/${g.toLowerCase().replace(/\s+/g, '-')}`} className="p-3 bg-card rounded-lg text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10 transition border border-border">{g}</Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
