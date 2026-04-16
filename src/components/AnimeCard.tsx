import { Link } from 'react-router-dom';
import type { Anime } from '@/lib/types';

interface AnimeCardProps {
  anime: Anime;
  showEpisode?: boolean;
  showScore?: boolean;
}

export function AnimeCard({ anime, showEpisode = true, showScore = false }: AnimeCardProps) {
  const animeId = anime.animeId || anime.slug || '';
  return (
    <Link to={`/anime/${animeId}`} className="group flex flex-col gap-2">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        {showEpisode && anime.episodes && (
          <div className="absolute top-2 left-2 gradient-bg text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
            Ep {anime.episodes}
          </div>
        )}
        {showScore && anime.score && (
          <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            ★ {anime.score}
          </div>
        )}
        {anime.latestReleaseDate && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <span className="text-[10px] text-white/80">{anime.latestReleaseDate}</span>
          </div>
        )}
      </div>
      <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {anime.title}
      </h3>
    </Link>
  );
}
