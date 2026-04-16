import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { AnimeCard } from '@/components/AnimeCard';
import { ComicCard } from '@/components/ComicCard';
import { DonghuaCard } from '@/components/DonghuaCard';
import { searchAnime, searchComic, searchDonghua } from '@/lib/api';
import type { Anime, Comic, DonghuaItem } from '@/lib/types';
import { Loader2, Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [tab, setTab] = useState<'anime' | 'comic' | 'donghua'>('anime');
  const [animeResults, setAnimeResults] = useState<Anime[]>([]);
  const [comicResults, setComicResults] = useState<Comic[]>([]);
  const [donghuaResults, setDonghuaResults] = useState<DonghuaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);
    const [a, c, d] = await Promise.all([searchAnime(term), searchComic(term), searchDonghua(term)]);
    setAnimeResults(a);
    setComicResults(c);
    setDonghuaResults(d);
    setLoading(false);
  };

  useEffect(() => { if (q) doSearch(q); }, [q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { setSearchParams({ q: query.trim() }); doSearch(query.trim()); }
  };

  const tabs = [
    { key: 'anime' as const, label: 'Anime', count: animeResults.length },
    { key: 'comic' as const, label: 'Komik', count: comicResults.length },
    { key: 'donghua' as const, label: 'Donghua', count: donghuaResults.length },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari anime, komik, donghua..." className="w-full h-10 pl-10 pr-4 bg-muted rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border" autoFocus />
        </form>

        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${tab === t.key ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tab === 'anime' && animeResults.map(a => <AnimeCard key={a.animeId} anime={a} />)}
            {tab === 'comic' && comicResults.map((c, i) => <ComicCard key={i} comic={c} />)}
            {tab === 'donghua' && donghuaResults.map(d => <DonghuaCard key={d.slug} item={d} />)}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
