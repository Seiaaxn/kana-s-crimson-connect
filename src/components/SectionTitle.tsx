import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionTitleProps {
  title: string;
  href?: string;
  showMore?: boolean;
}

export function SectionTitle({ title, href, showMore = false }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full gradient-bg" />
        <h2 className="text-base font-display font-bold text-foreground">{title}</h2>
      </div>
      {showMore && href && (
        <Link to={href} className="flex items-center gap-0.5 text-xs text-primary hover:underline font-medium">
          Lihat Semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
