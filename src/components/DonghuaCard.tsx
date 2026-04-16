import { Link } from 'react-router-dom';
import type { DonghuaItem } from '@/lib/types';

interface DonghuaCardProps {
  item: DonghuaItem;
}

function extractDetailSlug(item: DonghuaItem): string {
  // Popular/latest items have episode-level slugs, extract the base anime slug
  const slug = item.slug || '';
  // If slug contains "episode-" it's an episode slug - try to link to the watch page instead
  if (slug.includes('-episode-')) {
    return slug;
  }
  return slug;
}

function isDonghuaEpisodeSlug(slug: string): boolean {
  return slug.includes('-episode-');
}

export function DonghuaCard({ item }: DonghuaCardProps) {
  const slug = extractDetailSlug(item);
  const isEpisode = isDonghuaEpisodeSlug(slug);
  const linkTo = isEpisode ? `/donghua-watch/${slug}` : `/donghua/${slug}`;
  
  return (
    <Link to={linkTo} className="group flex flex-col gap-2">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
        <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        {item.episode && (
          <div className="absolute top-2 left-2 gradient-bg text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
            Ep {item.episode}
          </div>
        )}
        {item.type && (
          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {item.type}
          </div>
        )}
      </div>
      <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {item.title.split('\t')[0]}
      </h3>
    </Link>
  );
}
