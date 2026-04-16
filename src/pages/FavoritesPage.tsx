import { useState } from 'react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { getFavorites, removeFavorite } from '@/lib/storage';
import type { FavoriteItem } from '@/lib/types';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => getFavorites());
  const [tab, setTab] = useState<'all' | 'anime' | 'donghua' | 'comic'>('all');

  const filtered = tab === 'all' ? favorites : favorites.filter(f => f.type === tab);

  const handleRemove = (id: string, type: string) => {
    removeFavorite(id, type);
    setFavorites(getFavorites());
  };

  const getHref = (f: FavoriteItem) => {
    if (f.type === 'anime') return `/anime/${f.contentId}`;
    if (f.type === 'donghua') return `/donghua/${f.contentId}`;
    return `/comic/${f.contentId}`;
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="px-4 py-4 space-y-4 pb-24">
        <h1 className="text-xl font-display font-bold text-foreground">Favorit</h1>
        <div className="flex gap-2">
          {(['all', 'anime', 'donghua', 'comic'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition capitalize ${tab === t ? 'gradient-bg text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {t === 'all' ? 'Semua' : t}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Belum ada favorit</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map(f => (
              <div key={f.id} className="relative group">
                <Link to={getHref(f)} className="flex flex-col gap-2">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <img src={f.poster} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded font-semibold gradient-bg text-primary-foreground capitalize">{f.type}</div>
                  </div>
                  <h3 className="text-xs font-medium text-foreground line-clamp-2">{f.title}</h3>
                </Link>
                <button onClick={() => handleRemove(f.contentId, f.type)} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
