import { Link } from 'react-router-dom';
import type { Comic } from '@/lib/types';

function extractSlug(link: string): string {
  // Remove domain and /manga/ prefix, get last segment
  const cleaned = link.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
  const parts = cleaned.split('/');
  return parts[parts.length - 1] || '';
}

interface ComicCardProps {
  comic: Comic;
}

export function ComicCard({ comic }: ComicCardProps) {
  const slug = comic.slug || extractSlug(comic.link);
  
  // Skip non-comic entries (like APK ads)
  if (!slug || slug === 'plus' || comic.title.toLowerCase().includes('apk')) return null;
  
  return (
    <Link to={`/comic/${slug}`} className="group flex flex-col gap-2">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
        <img 
          src={comic.image} 
          alt={comic.title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
        />
        {comic.chapter && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
            <span className="text-[10px] text-white/80 font-medium">{comic.chapter}</span>
          </div>
        )}
        {comic.time_ago && (
          <div className="absolute top-2 left-2 bg-accent/90 text-accent-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {comic.time_ago}
          </div>
        )}
      </div>
      <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {comic.title}
      </h3>
    </Link>
  );
}
