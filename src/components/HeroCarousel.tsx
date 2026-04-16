import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Anime, DonghuaItem } from '@/lib/types';

interface HeroCarouselProps {
  animeList?: Anime[];
  donghuaList?: DonghuaItem[];
}

export function HeroCarousel({ animeList = [], donghuaList = [] }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    ...animeList.slice(0, 3).map(a => ({ title: a.title, poster: a.poster, score: a.score, episodes: a.episodes, href: `/anime/${a.animeId}`, type: 'Anime' as const })),
    ...donghuaList.slice(0, 2).map(d => ({ title: d.title.split('\t')[0], poster: d.poster, score: undefined, episodes: undefined, href: `/donghua/${d.slug}`, type: 'Donghua' as const })),
  ];

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex(prev => (prev + 1) % items.length), 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[currentIndex];

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl shadow-lg">
      <img src={current.poster} alt={current.title} className="w-full h-full object-cover transition-all duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

      <div className="absolute inset-0 flex items-end">
        <div className="w-full p-4 sm:p-6">
          <div className="max-w-[75%] space-y-2">
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold gradient-bg text-primary-foreground rounded-md">
                {current.type}
              </span>
              {current.episodes && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-secondary text-secondary-foreground rounded-md">
                  EP {current.episodes}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white line-clamp-2 drop-shadow-lg">{current.title}</h2>
            {current.score && (
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">{current.score}</span>
              </div>
            )}
            <Link to={current.href} className="inline-flex items-center gap-2 px-5 py-2.5 gradient-bg hover:opacity-90 text-primary-foreground font-semibold rounded-lg transition-all text-sm shadow-lg">
              <Play className="w-4 h-4" fill="currentColor" />
              Tonton Sekarang
            </Link>
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button onClick={() => setCurrentIndex((currentIndex - 1 + items.length) % items.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setCurrentIndex((currentIndex + 1) % items.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {items.map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'gradient-bg w-6' : 'bg-white/40'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
